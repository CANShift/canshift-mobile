import type {
  Characteristic,
  Device,
  Subscription,
} from "react-native-ble-plx";
import { BLE_SERVICE_UUID } from "../../constants/ble";
import { log } from "../../stores/log.store";
import { errText } from "../../lib/error-text";

const MONITOR_REVIVE_ATTEMPTS = 2;
const MONITOR_REVIVE_DELAY_MS = 400;

export interface MonitorSpec {
  device: Device;
  characteristic: string;
  label: string;
  handle: (value: string) => void;
  assign: (sub: Subscription | null) => void;
  onLost: () => void;
}

export interface MonitorHost {
  isCurrent: (device: Device) => boolean;
  hasConnection: () => boolean;
  runGatt: <T>(op: () => Promise<T>) => Promise<T>;
}

const monitorCharacteristic = (
  host: MonitorHost,
  spec: MonitorSpec,
  onDead: () => void,
): Subscription =>
  spec.device.monitorCharacteristicForService(
    BLE_SERVICE_UUID,
    spec.characteristic,
    (error: Error | null, char: Characteristic | null) => {
      if (error) {
        log("warn", `BLE: ${spec.label} monitor error — ${error.message}`);
        onDead();
        return;
      }
      if (!char?.value) return;
      if (!host.hasConnection()) return;
      spec.handle(char.value);
    },
  );

export const attachMonitor = (
  host: MonitorHost,
  spec: MonitorSpec,
  attempt: number,
): void => {
  try {
    spec.assign(
      monitorCharacteristic(host, spec, () => {
        spec.assign(null);
        reviveMonitor(host, spec, attempt);
      }),
    );
  } catch (err) {
    log(
      "warn",
      `BLE: could not attach the ${spec.label} monitor — ${errText(err)}`,
    );
    spec.assign(null);
    reviveMonitor(host, spec, attempt);
  }
};

const reviveMonitor = (
  host: MonitorHost,
  spec: MonitorSpec,
  attempt: number,
): void => {
  if (!host.isCurrent(spec.device)) return;
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
    if (!host.isCurrent(spec.device)) return;
    void host.runGatt(() => {
      attachMonitor(host, spec, next);
      return Promise.resolve();
    });
  }, MONITOR_REVIVE_DELAY_MS * next);
};

export const seedCharacteristic = async (
  host: MonitorHost,
  device: Device,
  characteristic: string,
  label: string,
  handle: (value: string) => void,
): Promise<void> => {
  try {
    const char = await host.runGatt(() =>
      device.readCharacteristicForService(BLE_SERVICE_UUID, characteristic),
    );
    if (!char.value) return;
    handle(char.value);
  } catch (err) {
    log("warn", `BLE: failed to seed ${label} — ${errText(err)}`);
  }
};
