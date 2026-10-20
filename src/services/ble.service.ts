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
import { clearMutedAlerts } from "../stores/alerts.store";
import { useAppSettingsStore } from "../stores/app-settings.store";
import type { CanIdFilter, TimerCommand } from "@canshift/core/wire";
import { rememberDevice, forgetDevice, getLastDevice } from "./last-device";
import {
  requestAndroidBlePermissions,
  type AndroidBlePermissionResult,
} from "./ble-permissions";
import { BleReconnector, type BleReconnectDeps } from "./ble-reconnect";
import { Toast, type ToastShowParams } from "../components/ui/toast";
import { STRINGS } from "../strings";
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
import { CanMonitorFeed } from "./ble/ble-can-monitor";
import { notifyDashLost } from "./notifications/dash-loss-notifications";

export type { ScanResult } from "./ble/ble-scan";
export type { CmdPayload } from "./ble/ble-writes";
export type { BlePermissionState } from "./ble/ble-permission-state";
export { isBleAvailable } from "./ble/ble-manager-factory";

export interface BleServiceDeps {
  managerFactory?: () => BleManager;
  requestAndroidPermissions?: () => Promise<AndroidBlePermissionResult>;
  showToast?: (params: ToastShowParams) => void;
  onDashLost?: () => void;
}

const showRootToast = (params: ToastShowParams): void => {
  Toast.show(params);
};

export class BleService {
  private readonly manager: BleManager;
  private readonly requestAndroidPermissions: () => Promise<AndroidBlePermissionResult>;
  private readonly reconnector: BleReconnector;
  private readonly gatt = new GattQueue();
  private readonly link: DeviceLink;
  readonly canMonitor: CanMonitorFeed;
  private readonly showToast: (params: ToastShowParams) => void;
  private readonly onDashLost: () => void;

  private userInitiatedDisconnect = false;
  private reconnectHeld = false;
  private activeScan: ActiveScan | null = null;

  constructor(deps: BleServiceDeps = {}) {
    this.manager = (deps.managerFactory ?? (() => this.createManager()))();
    this.requestAndroidPermissions =
      deps.requestAndroidPermissions ?? requestAndroidBlePermissions;
    this.showToast = deps.showToast ?? showRootToast;
    this.onDashLost = deps.onDashLost ?? notifyDashLost;
    this.link = new DeviceLink(this.gatt, {
      showToast: this.showToast,
      onLinkLost: (deviceId) => {
        this.reconnectAfterLoss(deviceId);
      },
      onDisconnected: (deviceId) => {
        this.handleDisconnected(deviceId);
      },
    });
    this.canMonitor = new CanMonitorFeed(this.link, () => this.link.current);
    this.reconnector = new BleReconnector(this.reconnectorDeps());
  }

  private createManager(): BleManager {
    return createBleManager((restoredState) => {
      handleRestoredState(
        this.link,
        (deviceId) => {
          void this.reconnector.run(deviceId);
        },
        restoredState,
      );
    });
  }

  private handleDisconnected(deviceId: string): void {
    if (this.userInitiatedDisconnect) {
      log("info", `Disconnected from ${deviceId} (user-initiated)`);
      return;
    }
    log("warn", `Device ${deviceId} disconnected unexpectedly`);
    this.reconnectAfterLoss(deviceId);
  }

  private reconnectorDeps(): BleReconnectDeps {
    return {
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
    };
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
    clearMutedAlerts();
    return this.connectInternal(deviceId);
  }

  private async connectInternal(deviceId: string): Promise<void> {
    const { setConnectionState } = useDeviceStore.getState();

    await this.ensureAndroidBlePermissions();

    setConnectionState("connecting");
    log("info", `Connecting to device ${deviceId}`);

    this.userInitiatedDisconnect = false;
    this.link.removeSubscriptions();

    try {
      const device = await this.openDevice(deviceId);
      this.markConnected(deviceId, device);
    } catch (err) {
      this.link.removeSubscriptions();
      this.link.setDevice(null);
      setConnectionState("idle");
      throw err;
    }
  }

  private async openDevice(deviceId: string): Promise<Device> {
    const device = await this.manager.connectToDevice(deviceId, {
      autoConnect: false,
      requestMTU: BLE_PREFERRED_MTU,
    });
    await device.discoverAllServicesAndCharacteristics();
    this.link.setDevice(device);
    await this.link.seedStatus(device);
    await this.link.seedTimer(device);
    await this.link.seedAlert(device);
    await this.link.seedPages(device);
    return device;
  }

  private markConnected(deviceId: string, device: Device): void {
    const name = device.name ?? BLE_DEVICE_NAME;
    useDeviceStore.getState().setDevice(deviceId, name);
    useDeviceStore.getState().setMode("ble");
    log("info", `Connected to ${name} (${deviceId})`);
    void rememberDevice(deviceId);
    useReconnectStore.getState().stop();
    this.link.bind(device);
    this.link.startStalenessTimer();
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
        log("warn", `Disconnect: cancelConnection failed: ${errText(err)}`);
        this.showToast({
          type: "error",
          text1: STRINGS.device.disconnectFailed,
        });
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

  async refreshDashPages(): Promise<void> {
    await this.link.seedPages(this.requireDevice());
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

  holdReconnect(): void {
    this.reconnectHeld = true;
    this.cancelReconnect();
  }

  releaseReconnect(): void {
    this.reconnectHeld = false;
  }

  async tryReconnectLastDevice(): Promise<boolean> {
    if (this.reconnectHeld) return false;
    if (!(await this.isBlePowered())) return false;
    const lastId = await getLastDevice();
    if (!lastId) return false;
    void this.reconnector.run(lastId);
    return true;
  }

  private reconnectAfterLoss(deviceId: string): void {
    if (this.reconnectHeld) {
      log("info", `Dash ${deviceId} left for workshop mode — not reconnecting`);
      return;
    }
    this.onDashLost();
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
export const refreshDashPages = bleService.refreshDashPages.bind(bleService);
export const startCanMonitor = () => bleService.canMonitor.start();
export const stopCanMonitor = () => {
  bleService.canMonitor.stop();
};
export const setCanMonitorFilter = (filters: readonly CanIdFilter[]) =>
  bleService.canMonitor.setFilter(filters);
export const getBlePermissionState =
  bleService.getBlePermissionState.bind(bleService);
export const holdReconnect = bleService.holdReconnect.bind(bleService);
export const releaseReconnect = bleService.releaseReconnect.bind(bleService);
export const tryReconnectLastDevice =
  bleService.tryReconnectLastDevice.bind(bleService);
