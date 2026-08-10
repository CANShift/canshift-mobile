import {
  BleManager,
  Device,
  State,
  Characteristic,
  Subscription,
  type BleRestoredState,
} from "react-native-ble-plx";
import { currentPlatform } from "../lib/platform";
import {
  BLE_SERVICE_UUID,
  BLE_CHAR_TELE,
  BLE_CHAR_STATUS,
  BLE_CHAR_SETTINGS,
  BLE_CHAR_CMD,
  BLE_CHAR_TIMER_CMD,
  BLE_CHAR_TIMER_STATE,
  BLE_CHAR_TIMER_LAP,
  BLE_DEVICE_NAME,
  BLE_PREFERRED_MTU,
} from "../constants/ble";
import { useDeviceStore } from "../stores/device.store";
import { useSignalsStore } from "../stores/signals.store";
import { clearBuffer } from "../stores/telemetry.store";
import { log } from "../stores/log.store";
import { useReconnectStore } from "../stores/reconnect.store";
import { useAppSettingsStore } from "../stores/app-settings.store";
import { parseDeviceSettings, parseTelemetry } from "./ble.validators";
import {
  encodeTimerCommand,
  parseBleStatus,
  parseTimerLap,
  parseTimerState,
  type TimerCommand,
} from "@canshift/core";
import { useTimerStore } from "../stores/timer.store";
import { recordSessionLap } from "../stores/timer-sessions.store";
import { decodeBase64, decodeBase64ToBytes, encodeBase64 } from "./base64";
import { rememberDevice, forgetDevice, getLastDevice } from "./last-device";
import {
  requestAndroidBlePermissions,
  type AndroidBlePermissionResult,
} from "./ble-permissions";
import { BlePermissionDeniedError } from "./ble.errors";
import { withGattRetry } from "./ble.retry";
import { BleReconnector } from "./ble-reconnect";
import { Toast, type ToastShowParams } from "../components/ui/toast";
import { errText } from "../lib/error-text";

export interface ScanResult {
  id: string;
  name: string;
  rssi: number | null;
}

let s_bleNativeAvailable = true;

export const isBleAvailable = (): boolean => s_bleNativeAvailable;

const createInertBleManager = (): BleManager => {
  const unavailable = (): Promise<never> =>
    Promise.reject(
      new Error(
        "Bluetooth is unavailable in this build — use a development build.",
      ),
    );
  const inert = {
    state: () => Promise.resolve(State.PoweredOff),
    startDeviceScan: () => undefined,
    stopDeviceScan: () => undefined,
    connectToDevice: () => unavailable(),
    destroy: () => Promise.resolve(),
  };
  return inert as unknown as BleManager;
};

export type CmdPayload = Record<string, boolean | number | string>;

export type BlePermissionState =
  | { kind: "ok" }
  | { kind: "powered_off" }
  | { kind: "unauthorized"; platform: "ios" | "android" }
  | { kind: "unsupported" }
  | { kind: "resetting" }
  | { kind: "unknown" };

const BLE_RESTORE_STATE_IDENTIFIER = "canshift.ble.central";

const STALENESS_CHECK_INTERVAL_MS = 500;
const STALENESS_THRESHOLD_MS = 2_000;

const MONITOR_REVIVE_ATTEMPTS = 2;
const MONITOR_REVIVE_DELAY_MS = 400;

interface MonitorSpec {
  device: Device;
  characteristic: string;
  label: string;
  handle: (value: string) => void;
  assign: (sub: Subscription | null) => void;
  onLost: () => void;
}

export interface BleServiceDeps {
  managerFactory?: () => BleManager;
  requestAndroidPermissions?: () => Promise<AndroidBlePermissionResult>;
  showToast?: (params: ToastShowParams) => void;
}

export class BleService {
  private readonly manager: BleManager;
  private readonly requestAndroidPermissions: () => Promise<AndroidBlePermissionResult>;
  private readonly showToast: (params: ToastShowParams) => void;

  private connectedDevice: Device | null = null;
  private stalenessTimer: ReturnType<typeof setInterval> | null = null;
  private teleSub: Subscription | null = null;
  private statusSub: Subscription | null = null;
  private timerStateSub: Subscription | null = null;
  private timerLapSub: Subscription | null = null;
  private disconnectSub: Subscription | null = null;
  private readonly reconnector: BleReconnector;

  private userInitiatedDisconnect = false;

  private activeScanStop: (() => void) | null = null;

  private gattQueue: Promise<unknown> = Promise.resolve();

  private runGatt<T>(op: () => Promise<T>): Promise<T> {
    const next = this.gattQueue.then(op, op);
    this.gattQueue = next.catch(() => undefined);
    return next;
  }

  constructor(deps: BleServiceDeps = {}) {
    const factory = deps.managerFactory ?? (() => this.createManager());
    this.manager = factory();
    this.requestAndroidPermissions =
      deps.requestAndroidPermissions ?? requestAndroidBlePermissions;
    this.showToast =
      deps.showToast ??
      ((params) => {
        Toast.show(params);
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

  private createManager(): BleManager {
    if (process.env.EXPO_PUBLIC_DISABLE_BLE === "1") {
      s_bleNativeAvailable = false;
      log(
        "warn",
        "BLE disabled via EXPO_PUBLIC_DISABLE_BLE — no CoreBluetooth activation",
      );
      return createInertBleManager();
    }
    try {
      return new BleManager({
        restoreStateIdentifier: BLE_RESTORE_STATE_IDENTIFIER,
        restoreStateFunction: (restoredState) => {
          this.handleRestoredState(restoredState);
        },
      });
    } catch (err) {
      s_bleNativeAvailable = false;
      log(
        "warn",
        `BLE native module unavailable (Expo Go?) — Bluetooth disabled: ${errText(err)}`,
      );
      return createInertBleManager();
    }
  }

  async dispose(): Promise<void> {
    this.cancelReconnect();
    this.stopStalenessTimer();
    this.removeSubscriptions();
    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
      } catch (err) {
        log("warn", `dispose: cancelConnection failed: ${errText(err)}`);
      }
      this.connectedDevice = null;
    }
    await this.manager.destroy();
  }

  async scan(
    onFound: (device: ScanResult) => void,
    timeoutMs = 10000,
  ): Promise<void> {
    await this.ensureAndroidBlePermissions();
    this.cancelReconnect();
    return new Promise((resolve, reject) => {
      const found = new Set<string>();
      let settled = false;
      let timer: ReturnType<typeof setTimeout> | null = null;

      const finish = (): void => {
        if (settled) return;
        settled = true;
        if (timer !== null) clearTimeout(timer);
        this.activeScanStop = null;
        void this.manager.stopDeviceScan();
        resolve();
      };
      this.activeScanStop = finish;

      void this.manager.startDeviceScan(
        [BLE_SERVICE_UUID],
        { allowDuplicates: false },
        (error, device) => {
          if (settled) return;
          if (error) {
            settled = true;
            if (timer !== null) clearTimeout(timer);
            this.activeScanStop = null;
            void this.manager.stopDeviceScan();
            reject(error);
            return;
          }
          if (
            device?.name?.includes(BLE_DEVICE_NAME) &&
            !found.has(device.id)
          ) {
            found.add(device.id);
            onFound({
              id: device.id,
              name: device.name,
              rssi: device.rssi ?? null,
            });
          }
        },
      );

      timer = setTimeout(finish, timeoutMs);
    });
  }

  stopScan(): void {
    if (this.activeScanStop) {
      this.activeScanStop();
      return;
    }
    void this.manager.stopDeviceScan();
  }

  async connect(deviceId: string): Promise<void> {
    this.cancelReconnect();
    return this.connectInternal(deviceId);
  }

  private async connectInternal(deviceId: string): Promise<void> {
    const { setConnectionState, setDevice, setFirmwareStatus } =
      useDeviceStore.getState();

    await this.ensureAndroidBlePermissions();

    setConnectionState("connecting");
    log("info", `Connecting to device ${deviceId}`);

    this.userInitiatedDisconnect = false;

    this.removeSubscriptions();

    try {
      const device = await this.manager.connectToDevice(deviceId, {
        autoConnect: false,
        requestMTU: BLE_PREFERRED_MTU,
      });
      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevice = device;

      await this.seedStatusFromDevice(device, setFirmwareStatus);
      await this.seedTimerFromDevice(device);

      setDevice(deviceId, device.name ?? BLE_DEVICE_NAME);
      useDeviceStore.getState().setMode("ble");
      log(
        "info",
        `Connected to ${device.name ?? BLE_DEVICE_NAME} (${deviceId})`,
      );

      void rememberDevice(deviceId);
      useReconnectStore.getState().stop();

      this.bindDeviceSubscriptions(device);
      this.startStalenessTimer();
    } catch (err) {
      this.removeSubscriptions();
      this.connectedDevice = null;
      setConnectionState("idle");
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    this.userInitiatedDisconnect = true;
    this.cancelReconnect();
    this.stopStalenessTimer();
    this.removeSubscriptions();
    if (this.connectedDevice) {
      const id = this.connectedDevice.id;
      try {
        await this.connectedDevice.cancelConnection();
        log("info", `Disconnected from ${id}`);
      } catch (err) {
        log("warn", `disconnect: cancelConnection failed: ${errText(err)}`);
      }
      this.connectedDevice = null;
    }
    clearBuffer();
    useDeviceStore.getState().disconnect();
    await forgetDevice();
  }

  async pushSettings(settings: {
    brightness: number;
    sleep: number;
  }): Promise<void> {
    const device = this.connectedDevice;
    if (!device) throw new Error("Not connected");
    const json = JSON.stringify(settings);
    await withGattRetry(() =>
      this.runGatt(() =>
        device.writeCharacteristicWithResponseForService(
          BLE_SERVICE_UUID,
          BLE_CHAR_SETTINGS,
          encodeBase64(json),
        ),
      ),
    );
  }

  async readSettings(): Promise<{ brightness: number; sleep: number } | null> {
    const device = this.connectedDevice;
    if (!device) throw new Error("Not connected");
    const char = await withGattRetry(() =>
      this.runGatt(() =>
        device.readCharacteristicForService(
          BLE_SERVICE_UUID,
          BLE_CHAR_SETTINGS,
        ),
      ),
    );
    if (!char.value) return null;
    const settings = parseDeviceSettings(decodeBase64(char.value));
    if (settings === null) {
      log("warn", "Ignoring malformed settings from device — using defaults");
      return null;
    }
    return settings;
  }

  async sendTimerCommand(command: TimerCommand): Promise<void> {
    const device = this.connectedDevice;
    if (!device) throw new Error("Not connected");
    await withGattRetry(() =>
      this.runGatt(() =>
        device.writeCharacteristicWithoutResponseForService(
          BLE_SERVICE_UUID,
          BLE_CHAR_TIMER_CMD,
          encodeBase64(encodeTimerCommand(command)),
        ),
      ),
    );
  }

  async sendCmd(cmd: string, payload?: CmdPayload): Promise<void> {
    const device = this.connectedDevice;
    if (!device) throw new Error("Not connected");
    const body: Record<string, boolean | number | string> = {
      cmd,
      ...(payload ?? {}),
    };
    const json = JSON.stringify(body);
    await withGattRetry(() =>
      this.runGatt(() =>
        device.writeCharacteristicWithoutResponseForService(
          BLE_SERVICE_UUID,
          BLE_CHAR_CMD,
          encodeBase64(json),
        ),
      ),
    );
  }

  _test_setConnectedDevice(device: Device | null): void {
    this.connectedDevice = device;
  }

  async getBlePermissionState(): Promise<BlePermissionState> {
    const state = await this.manager.state();
    switch (state) {
      case State.PoweredOn:
        return { kind: "ok" };
      case State.PoweredOff:
        return { kind: "powered_off" };
      case State.Unauthorized:
        return { kind: "unauthorized", platform: currentPlatform() };
      case State.Unsupported:
        return { kind: "unsupported" };
      case State.Resetting:
        return { kind: "resetting" };
      case State.Unknown:
        return { kind: "unknown" };
      default: {
        const _exhaustive: never = state;
        return _exhaustive;
      }
    }
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

  private monitorCharacteristic(
    device: Device,
    characteristic: string,
    label: string,
    handle: (value: string) => void,
    onDead: () => void,
  ): Subscription {
    return device.monitorCharacteristicForService(
      BLE_SERVICE_UUID,
      characteristic,
      (error: Error | null, char: Characteristic | null) => {
        if (error) {
          log("warn", `BLE: ${label} monitor error — ${error.message}`);
          onDead();
          return;
        }
        if (!char?.value) return;
        if (!this.connectedDevice) return;
        handle(char.value);
      },
    );
  }

  private attachMonitor(spec: MonitorSpec, attempt: number): void {
    try {
      spec.assign(
        this.monitorCharacteristic(
          spec.device,
          spec.characteristic,
          spec.label,
          spec.handle,
          () => {
            spec.assign(null);
            this.reviveMonitor(spec, attempt);
          },
        ),
      );
    } catch (err) {
      const msg = errText(err);
      log("warn", `BLE: could not attach the ${spec.label} monitor — ${msg}`);
      spec.assign(null);
      this.reviveMonitor(spec, attempt);
    }
  }

  private reviveMonitor(spec: MonitorSpec, attempt: number): void {
    if (this.connectedDevice !== spec.device) return;
    if (attempt >= MONITOR_REVIVE_ATTEMPTS) {
      spec.onLost();
      return;
    }
    const next = attempt + 1;
    log(
      "info",
      `BLE: re-subscribing to ${spec.label} (attempt ${String(next)} of ${String(MONITOR_REVIVE_ATTEMPTS)})`,
    );
    setTimeout(() => {
      if (this.connectedDevice !== spec.device) return;
      void this.runGatt(() => {
        this.attachMonitor(spec, next);
        return Promise.resolve();
      });
    }, MONITOR_REVIVE_DELAY_MS * next);
  }

  private handleMonitorLinkLost(device: Device, label: string): void {
    if (this.connectedDevice !== device) return;
    log(
      "error",
      `BLE: the ${label} monitor did not come back — treating the link as lost`,
    );
    this.teardownLink();
    useDeviceStore.getState().setError({ kind: "disconnected" });
    this.reconnectAfterLoss(device.id);
  }

  private handleTimerMonitorLost(
    device: Device,
    label: string,
    text1: string,
    text2: string,
  ): void {
    if (this.connectedDevice !== device) return;
    log("error", `BLE: the ${label} monitor did not come back — ${text2}`);
    this.showToast({ type: "error", text1, text2 });
  }

  private async seedCharacteristic(
    device: Device,
    characteristic: string,
    label: string,
    handle: (value: string) => void,
  ): Promise<void> {
    try {
      const char = await this.runGatt(() =>
        device.readCharacteristicForService(BLE_SERVICE_UUID, characteristic),
      );
      if (!char.value) return;
      handle(char.value);
    } catch (err) {
      const msg = errText(err);
      log("warn", `BLE: failed to seed ${label} — ${msg}`);
    }
  }

  private bindDeviceSubscriptions(device: Device): void {
    this.connectedDevice = device;
    this.bindTelemetryMonitor(device);
    this.bindStatusMonitor(device);
    this.bindTimerStateMonitor(device);
    this.bindTimerLapMonitor(device);
    this.bindDisconnectHandler(device);
  }

  private bindTelemetryMonitor(device: Device): void {
    this.attachMonitor(
      {
        device,
        characteristic: BLE_CHAR_TELE,
        label: "telemetry",
        handle: (value) => {
          const payload = parseTelemetry(decodeBase64ToBytes(value));
          if (!payload) {
            log("warn", "BLE: rejected malformed telemetry payload");
            return;
          }
          useSignalsStore.getState().update(payload);
        },
        assign: (sub) => {
          this.teleSub = sub;
        },
        onLost: () => {
          this.handleMonitorLinkLost(device, "telemetry");
        },
      },
      0,
    );
  }

  private bindStatusMonitor(device: Device): void {
    this.attachMonitor(
      {
        device,
        characteristic: BLE_CHAR_STATUS,
        label: "status",
        handle: (value) => {
          const result = parseBleStatus(decodeBase64(value));
          if (result.kind !== "ok") {
            log(
              "warn",
              `BLE: rejected malformed status payload (${result.kind})`,
            );
            return;
          }
          const s = result.status;
          const store = useDeviceStore.getState();
          store.setFirmwareStatus(
            s.firmwareVersion ?? "?",
            s.canHealthy ?? false,
          );
          if (s.isDay !== undefined) store.setIsDayMode(s.isDay);
        },
        assign: (sub) => {
          this.statusSub = sub;
        },
        onLost: () => {
          this.handleMonitorLinkLost(device, "status");
        },
      },
      0,
    );
  }

  private bindTimerStateMonitor(device: Device): void {
    this.attachMonitor(
      {
        device,
        characteristic: BLE_CHAR_TIMER_STATE,
        label: "timer state",
        handle: (value) => {
          const result = parseTimerState(decodeBase64(value));
          if (result.kind !== "ok") {
            log(
              "warn",
              `BLE: rejected malformed timer state payload (${result.kind})`,
            );
            return;
          }
          useTimerStore.getState().applyDeviceState(result.state);
        },
        assign: (sub) => {
          this.timerStateSub = sub;
        },
        onLost: () => {
          this.handleTimerMonitorLost(
            device,
            "timer state",
            "Timer sync lost",
            "Reconnect the device — the timer no longer follows the dash.",
          );
        },
      },
      0,
    );
  }

  private bindTimerLapMonitor(device: Device): void {
    this.attachMonitor(
      {
        device,
        characteristic: BLE_CHAR_TIMER_LAP,
        label: "timer lap",
        handle: (value) => {
          const result = parseTimerLap(decodeBase64(value));
          if (result.kind !== "ok") {
            log(
              "warn",
              `BLE: rejected malformed timer lap payload (${result.kind})`,
            );
            return;
          }
          useTimerStore.getState().applyDeviceLap(result.lap);
          recordSessionLap(result.lap);
        },
        assign: (sub) => {
          this.timerLapSub = sub;
        },
        onLost: () => {
          this.handleTimerMonitorLost(
            device,
            "timer lap",
            "Lap stream lost",
            "Reconnect the device — this session is no longer recording laps.",
          );
        },
      },
      0,
    );
  }

  private bindDisconnectHandler(device: Device): void {
    this.disconnectSub = device.onDisconnected(() => {
      this.teardownLink();
      if (this.userInitiatedDisconnect) {
        log("info", `Disconnected from ${device.id} (user-initiated)`);
        return;
      }
      log("warn", `Device ${device.id} disconnected unexpectedly`);
      this.reconnectAfterLoss(device.id);
    });
  }

  private teardownLink(): void {
    this.connectedDevice = null;
    this.removeSubscriptions();
    this.stopStalenessTimer();
    useDeviceStore.getState().disconnect();
    useTimerStore.getState().clearDeviceSync();
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

  private handleRestoredState(restoredState: BleRestoredState | null): void {
    if (!restoredState) {
      log("info", "BLE restore: no prior state (fresh launch)");
      return;
    }

    const peripherals = restoredState.connectedPeripherals;
    if (peripherals.length === 0) {
      log("info", "BLE restore: state present but no connected peripherals");
      return;
    }

    if (peripherals.length > 1) {
      log(
        "warn",
        `BLE restore: ${String(peripherals.length)} peripherals restored — using first`,
      );
    }
    const device = peripherals[0];
    if (!device) return;

    log(
      "info",
      `BLE restore: re-binding to ${device.name ?? BLE_DEVICE_NAME} (${device.id})`,
    );

    void this.resumeRestoredDevice(device);
  }

  private async resumeRestoredDevice(device: Device): Promise<void> {
    try {
      await device.discoverAllServicesAndCharacteristics();
    } catch (err) {
      const msg = errText(err);
      log(
        "warn",
        `BLE restore: service discovery failed — falling back to reconnect: ${msg}`,
      );
      void this.reconnector.run(device.id);
      return;
    }

    this.removeSubscriptions();
    this.bindDeviceSubscriptions(device);

    const store = useDeviceStore.getState();
    store.setDevice(device.id, device.name ?? BLE_DEVICE_NAME);
    store.setMode("ble");

    void rememberDevice(device.id);
    useReconnectStore.getState().stop();

    void this.seedStatusFromDevice(device);
    void this.seedTimerFromDevice(device);

    this.startStalenessTimer();
  }

  private async seedTimerFromDevice(device: Device): Promise<void> {
    await this.seedCharacteristic(
      device,
      BLE_CHAR_TIMER_STATE,
      "TIMER state",
      (value) => {
        const result = parseTimerState(decodeBase64(value));
        if (result.kind !== "ok") {
          log(
            "warn",
            `BLE: rejected malformed initial timer state payload (${result.kind})`,
          );
          return;
        }
        useTimerStore.getState().applyDeviceState(result.state);
      },
    );
  }

  private async seedStatusFromDevice(
    device: Device,
    setFirmwareStatus: (
      version: string,
      canHealthy: boolean,
    ) => void = useDeviceStore.getState().setFirmwareStatus,
  ): Promise<void> {
    await this.seedCharacteristic(
      device,
      BLE_CHAR_STATUS,
      "STATUS",
      (value) => {
        const result = parseBleStatus(decodeBase64(value));
        if (result.kind !== "ok") {
          log(
            "warn",
            `BLE: rejected malformed initial status payload (${result.kind})`,
          );
          return;
        }
        const status = result.status;
        setFirmwareStatus(
          status.firmwareVersion ?? "?",
          status.canHealthy ?? false,
        );
        const store = useDeviceStore.getState();
        if (status.isDay !== undefined) {
          store.setIsDayMode(status.isDay);
        }
      },
    );
  }

  private startStalenessTimer(): void {
    this.stopStalenessTimer();
    this.stalenessTimer = setInterval(() => {
      const { lastUpdateMs, isLive } = useSignalsStore.getState();
      if (isLive && Date.now() - lastUpdateMs > STALENESS_THRESHOLD_MS) {
        useSignalsStore.getState().markStale();
      }
    }, STALENESS_CHECK_INTERVAL_MS);
  }

  private stopStalenessTimer(): void {
    if (this.stalenessTimer) {
      clearInterval(this.stalenessTimer);
      this.stalenessTimer = null;
    }
  }

  private removeSubscriptions(): void {
    this.teleSub?.remove();
    this.teleSub = null;
    this.statusSub?.remove();
    this.statusSub = null;
    this.timerStateSub?.remove();
    this.timerStateSub = null;
    this.timerLapSub?.remove();
    this.timerLapSub = null;
    this.disconnectSub?.remove();
    this.disconnectSub = null;
  }

  private async ensureAndroidBlePermissions(): Promise<void> {
    const result = await this.requestAndroidPermissions();
    switch (result.kind) {
      case "granted":
      case "not_applicable":
        return;
      case "denied":
      case "never_ask_again": {
        throw new BlePermissionDeniedError();
      }
      default: {
        const _exhaustive: never = result;
        return _exhaustive;
      }
    }
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
