import type { BleManager, Device } from "react-native-ble-plx";
import { State } from "react-native-ble-plx";
import {
  BLE_SERVICE_UUID,
  BLE_DEVICE_NAME,
  BLE_PREFERRED_MTU,
} from "../constants/ble";
import { useDeviceStore } from "../stores/device.store";
import { clearBuffer } from "../stores/telemetry.store";
import { log } from "../stores/log.store";
import { useReconnectStore } from "../stores/reconnect.store";
import { useAppSettingsStore } from "../stores/app-settings.store";
import type { TimerCommand } from "@canshift/core";
import { rememberDevice, forgetDevice, getLastDevice } from "./last-device";
import {
  requestAndroidBlePermissions,
  type AndroidBlePermissionResult,
} from "./ble-permissions";
import { BleReconnector } from "./ble-reconnect";
import { Toast, type ToastShowParams } from "../components/ui/toast";
import { errText } from "../lib/error-text";
import { createBleManager } from "./ble/ble-manager-factory";
import {
  scanForDevices,
  type ActiveScan,
  type ScanResult,
} from "./ble/ble-scan";
import { GattQueue } from "./ble/ble-gatt-queue";
import {
  writeSettings,
  readDeviceSettings,
  writeTimerCommand,
  writeCmd,
  type CmdPayload,
  type DeviceSettings,
} from "./ble/ble-writes";
import {
  blePermissionStateFrom,
  assertAndroidPermission,
  type BlePermissionState,
} from "./ble/ble-permission-state";
import { handleRestoredState } from "./ble/ble-restore";
import { DeviceLink } from "./ble/ble-link";

export type { ScanResult } from "./ble/ble-scan";
export type { CmdPayload } from "./ble/ble-writes";
export type { BlePermissionState } from "./ble/ble-permission-state";
export { isBleAvailable } from "./ble/ble-manager-factory";

export interface BleServiceDeps {
  managerFactory?: () => BleManager;
  requestAndroidPermissions?: () => Promise<AndroidBlePermissionResult>;
  showToast?: (params: ToastShowParams) => void;
}

export class BleService {
  private readonly manager: BleManager;
  private readonly requestAndroidPermissions: () => Promise<AndroidBlePermissionResult>;
  private readonly reconnector: BleReconnector;
  private readonly gatt = new GattQueue();
  private readonly link: DeviceLink;

  private userInitiatedDisconnect = false;
  private activeScan: ActiveScan | null = null;

  constructor(deps: BleServiceDeps = {}) {
    const factory =
      deps.managerFactory ??
      (() =>
        createBleManager((restoredState) => {
          handleRestoredState(
            this.link,
            (deviceId) => {
              void this.reconnector.run(deviceId);
            },
            restoredState,
          );
        }));
    this.manager = factory();
    this.requestAndroidPermissions =
      deps.requestAndroidPermissions ?? requestAndroidBlePermissions;
    const showToast =
      deps.showToast ??
      ((params: ToastShowParams) => {
        Toast.show(params);
      });
    this.link = new DeviceLink(this.gatt, {
      showToast,
      onLinkLost: (deviceId) => {
        this.reconnectAfterLoss(deviceId);
      },
      onDisconnected: (deviceId) => {
        if (this.userInitiatedDisconnect) {
          log("info", `Disconnected from ${deviceId} (user-initiated)`);
          return;
        }
        log("warn", `Device ${deviceId} disconnected unexpectedly`);
        this.reconnectAfterLoss(deviceId);
      },
    });
    this.reconnector = new BleReconnector({
      connect: (deviceId) => this.connectInternal(deviceId),
      startScan: (onResult) => {
        void this.manager.startDeviceScan(
          [BLE_SERVICE_UUID],
          { allowDuplicates: false },
          (error, device) => {
            onResult(error, device?.id ?? null);
          },
        );
      },
      stopScan: () => {
        void this.manager.stopDeviceScan();
      },
    });
  }

  async dispose(): Promise<void> {
    this.cancelReconnect();
    this.link.stopStalenessTimer();
    this.link.removeSubscriptions();
    const device = this.link.current;
    if (device) {
      try {
        await device.cancelConnection();
      } catch (err) {
        log("warn", `dispose: cancelConnection failed: ${errText(err)}`);
      }
      this.link.setDevice(null);
    }
    await this.manager.destroy();
  }

  async scan(
    onFound: (device: ScanResult) => void,
    timeoutMs = 10000,
  ): Promise<void> {
    await this.ensureAndroidBlePermissions();
    this.cancelReconnect();
    const active = scanForDevices(this.manager, onFound, timeoutMs);
    this.activeScan = active;
    try {
      await active.promise;
    } finally {
      this.activeScan = null;
    }
  }

  stopScan(): void {
    if (this.activeScan) {
      this.activeScan.stop();
      return;
    }
    void this.manager.stopDeviceScan();
  }

  async connect(deviceId: string): Promise<void> {
    this.cancelReconnect();
    return this.connectInternal(deviceId);
  }

  private async connectInternal(deviceId: string): Promise<void> {
    const { setConnectionState, setDevice } = useDeviceStore.getState();

    await this.ensureAndroidBlePermissions();

    setConnectionState("connecting");
    log("info", `Connecting to device ${deviceId}`);

    this.userInitiatedDisconnect = false;
    this.link.removeSubscriptions();

    try {
      const device = await this.manager.connectToDevice(deviceId, {
        autoConnect: false,
        requestMTU: BLE_PREFERRED_MTU,
      });
      await device.discoverAllServicesAndCharacteristics();
      this.link.setDevice(device);

      await this.link.seedStatus(device);
      await this.link.seedTimer(device);

      setDevice(deviceId, device.name ?? BLE_DEVICE_NAME);
      useDeviceStore.getState().setMode("ble");
      log(
        "info",
        `Connected to ${device.name ?? BLE_DEVICE_NAME} (${deviceId})`,
      );

      void rememberDevice(deviceId);
      useReconnectStore.getState().stop();

      this.link.bind(device);
      this.link.startStalenessTimer();
    } catch (err) {
      this.link.removeSubscriptions();
      this.link.setDevice(null);
      setConnectionState("idle");
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    this.userInitiatedDisconnect = true;
    this.cancelReconnect();
    this.link.stopStalenessTimer();
    this.link.removeSubscriptions();
    const device = this.link.current;
    if (device) {
      try {
        await device.cancelConnection();
        log("info", `Disconnected from ${device.id}`);
      } catch (err) {
        log("warn", `disconnect: cancelConnection failed: ${errText(err)}`);
      }
      this.link.setDevice(null);
    }
    clearBuffer();
    useDeviceStore.getState().disconnect();
    await forgetDevice();
  }

  private requireDevice(): Device {
    const device = this.link.current;
    if (!device) throw new Error("Not connected");
    return device;
  }

  async pushSettings(settings: DeviceSettings): Promise<void> {
    await writeSettings(this.gatt, this.requireDevice(), settings);
  }

  async readSettings(): Promise<DeviceSettings | null> {
    return readDeviceSettings(this.gatt, this.requireDevice());
  }

  async sendTimerCommand(command: TimerCommand): Promise<void> {
    await writeTimerCommand(this.gatt, this.requireDevice(), command);
  }

  async sendCmd(cmd: string, payload?: CmdPayload): Promise<void> {
    await writeCmd(this.gatt, this.requireDevice(), cmd, payload);
  }

  _test_setConnectedDevice(device: Device | null): void {
    this.link.setDevice(device);
  }

  async getBlePermissionState(): Promise<BlePermissionState> {
    return blePermissionStateFrom(await this.manager.state());
  }

  async isBlePowered(): Promise<boolean> {
    const state = await this.manager.state();
    return state === State.PoweredOn;
  }

  cancelReconnect(): void {
    this.reconnector.cancel();
  }

  async tryReconnectLastDevice(): Promise<boolean> {
    if (!(await this.isBlePowered())) return false;
    const lastId = await getLastDevice();
    if (!lastId) return false;
    void this.reconnector.run(lastId);
    return true;
  }

  private reconnectAfterLoss(deviceId: string): void {
    if (useAppSettingsStore.getState().reconnectBehavior === "off") {
      log(
        "info",
        `Auto-reconnect disabled in settings — not reconnecting ${deviceId}`,
      );
      return;
    }
    void this.reconnector.run(deviceId);
  }

  private async ensureAndroidBlePermissions(): Promise<void> {
    assertAndroidPermission(await this.requestAndroidPermissions());
  }
}

export const bleService = new BleService();

export const scan = bleService.scan.bind(bleService);
export const stopScan = bleService.stopScan.bind(bleService);
export const connect = bleService.connect.bind(bleService);
export const disconnect = bleService.disconnect.bind(bleService);
export const cancelReconnect = bleService.cancelReconnect.bind(bleService);
export const pushSettings = bleService.pushSettings.bind(bleService);
export const readSettings = bleService.readSettings.bind(bleService);
export const sendCmd = bleService.sendCmd.bind(bleService);
export const sendTimerCommand = bleService.sendTimerCommand.bind(bleService);
export const getBlePermissionState =
  bleService.getBlePermissionState.bind(bleService);
export const isBlePowered = bleService.isBlePowered.bind(bleService);
export const tryReconnectLastDevice =
  bleService.tryReconnectLastDevice.bind(bleService);
