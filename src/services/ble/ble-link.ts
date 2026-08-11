import type { Device, Subscription } from "react-native-ble-plx";
import {
  BLE_CHAR_TELE,
  BLE_CHAR_STATUS,
  BLE_CHAR_TIMER_STATE,
  BLE_CHAR_TIMER_LAP,
} from "../../constants/ble";
import { log } from "../../stores/log.store";
import { useDeviceStore } from "../../stores/device.store";
import { useSignalsStore } from "../../stores/signals.store";
import { useTimerStore } from "../../stores/timer.store";
import type { ToastShowParams } from "../../components/ui/toast";
import type { GattQueue } from "./ble-gatt-queue";
import {
  attachMonitor,
  seedCharacteristic,
  type MonitorHost,
} from "./ble-monitors";
import {
  handleTelemetry,
  handleStatus,
  handleTimerState,
  handleTimerLap,
  handleInitialStatus,
  handleInitialTimerState,
} from "./ble-payload-handlers";

const STALENESS_CHECK_INTERVAL_MS = 250;
const STALENESS_THRESHOLD_MS = 500;

export interface LinkCallbacks {
  onLinkLost: (deviceId: string) => void;
  onDisconnected: (deviceId: string) => void;
  showToast: (params: ToastShowParams) => void;
}

interface TimerLossCopy {
  text1: string;
  text2: string;
}

const TIMER_LOSS_COPY: Record<string, TimerLossCopy> = {
  "timer state": {
    text1: "Timer sync lost",
    text2: "Reconnect the device — the timer no longer follows the dash.",
  },
  "timer lap": {
    text1: "Lap stream lost",
    text2: "Reconnect the device — this session is no longer recording laps.",
  },
};

export class DeviceLink implements MonitorHost {
  private device: Device | null = null;
  private stalenessTimer: ReturnType<typeof setInterval> | null = null;
  private teleSub: Subscription | null = null;
  private statusSub: Subscription | null = null;
  private timerStateSub: Subscription | null = null;
  private timerLapSub: Subscription | null = null;
  private disconnectSub: Subscription | null = null;

  constructor(
    private readonly gatt: GattQueue,
    private readonly callbacks: LinkCallbacks,
  ) {}

  isCurrent = (device: Device): boolean => this.device === device;

  hasConnection = (): boolean => this.device !== null;

  runGatt = <T>(op: () => Promise<T>): Promise<T> => this.gatt.run(op);

  get current(): Device | null {
    return this.device;
  }

  setDevice(device: Device | null): void {
    this.device = device;
  }

  seedStatus(device: Device): Promise<void> {
    return seedCharacteristic(
      this,
      device,
      BLE_CHAR_STATUS,
      "STATUS",
      handleInitialStatus,
    );
  }

  seedTimer(device: Device): Promise<void> {
    return seedCharacteristic(
      this,
      device,
      BLE_CHAR_TIMER_STATE,
      "TIMER state",
      handleInitialTimerState,
    );
  }

  bind(device: Device): void {
    this.device = device;
    this.bindLinkMonitor(
      device,
      BLE_CHAR_TELE,
      "telemetry",
      handleTelemetry,
      (sub) => {
        this.teleSub = sub;
      },
    );
    this.bindLinkMonitor(
      device,
      BLE_CHAR_STATUS,
      "status",
      handleStatus,
      (sub) => {
        this.statusSub = sub;
      },
    );
    this.bindTimerMonitor(
      device,
      BLE_CHAR_TIMER_STATE,
      "timer state",
      handleTimerState,
      (sub) => {
        this.timerStateSub = sub;
      },
    );
    this.bindTimerMonitor(
      device,
      BLE_CHAR_TIMER_LAP,
      "timer lap",
      handleTimerLap,
      (sub) => {
        this.timerLapSub = sub;
      },
    );
    this.disconnectSub = device.onDisconnected(() => {
      this.teardown();
      this.callbacks.onDisconnected(device.id);
    });
  }

  private bindLinkMonitor(
    device: Device,
    characteristic: string,
    label: string,
    handle: (value: string) => void,
    assign: (sub: Subscription | null) => void,
  ): void {
    attachMonitor(
      this,
      {
        device,
        characteristic,
        label,
        handle,
        assign,
        onLost: () => {
          this.handleLinkLost(device, label);
        },
      },
      0,
    );
  }

  private bindTimerMonitor(
    device: Device,
    characteristic: string,
    label: string,
    handle: (value: string) => void,
    assign: (sub: Subscription | null) => void,
  ): void {
    attachMonitor(
      this,
      {
        device,
        characteristic,
        label,
        handle,
        assign,
        onLost: () => {
          this.handleTimerLost(device, label);
        },
      },
      0,
    );
  }

  private handleLinkLost(device: Device, label: string): void {
    if (this.device !== device) return;
    log(
      "error",
      `BLE: the ${label} monitor did not come back — treating the link as lost`,
    );
    this.teardown();
    useDeviceStore.getState().setError({ kind: "disconnected" });
    this.callbacks.onLinkLost(device.id);
  }

  private handleTimerLost(device: Device, label: string): void {
    if (this.device !== device) return;
    const copy = TIMER_LOSS_COPY[label];
    if (!copy) return;
    log("error", `BLE: the ${label} monitor did not come back — ${copy.text2}`);
    this.callbacks.showToast({ type: "error", ...copy });
  }

  teardown(): void {
    this.device = null;
    this.removeSubscriptions();
    this.stopStalenessTimer();
    useDeviceStore.getState().disconnect();
    useTimerStore.getState().clearDeviceSync();
  }

  startStalenessTimer(): void {
    this.stopStalenessTimer();
    this.stalenessTimer = setInterval(() => {
      const { lastUpdateMs, isLive } = useSignalsStore.getState();
      if (isLive && Date.now() - lastUpdateMs > STALENESS_THRESHOLD_MS) {
        useSignalsStore.getState().markStale();
      }
    }, STALENESS_CHECK_INTERVAL_MS);
  }

  stopStalenessTimer(): void {
    if (this.stalenessTimer) {
      clearInterval(this.stalenessTimer);
      this.stalenessTimer = null;
    }
  }

  removeSubscriptions(): void {
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
}
