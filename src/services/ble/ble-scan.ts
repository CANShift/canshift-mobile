import type { BleManager, Device } from "react-native-ble-plx";
import { BLE_SERVICE_UUID, BLE_DEVICE_NAME } from "../../constants/ble";

export interface ScanResult {
  id: string;
  name: string;
  rssi: number | null;
}

export interface ActiveScan {
  promise: Promise<void>;
  stop: () => void;
}

type ScanFound = (device: ScanResult) => void;

const reportDevice = (
  device: Device | null,
  found: Set<string>,
  onFound: ScanFound,
): void => {
  if (!device?.name?.includes(BLE_DEVICE_NAME) || found.has(device.id)) return;
  found.add(device.id);
  onFound({ id: device.id, name: device.name, rssi: device.rssi ?? null });
};

interface ScanState {
  settled: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  found: Set<string>;
}

const scanListener =
  (state: ScanState, onFound: ScanFound, finish: (error?: Error) => void) =>
  (error: Error | null, device: Device | null): void => {
    if (state.settled) return;
    if (error) {
      finish(error);
      return;
    }
    reportDevice(device, state.found, onFound);
  };

const runScan = (
  manager: BleManager,
  onFound: ScanFound,
  timeoutMs: number,
  settle: { resolve: () => void; reject: (error: Error) => void },
): (() => void) => {
  const state: ScanState = { settled: false, timer: null, found: new Set() };
  const finish = (error?: Error): void => {
    if (state.settled) return;
    state.settled = true;
    if (state.timer !== null) clearTimeout(state.timer);
    void manager.stopDeviceScan();
    if (error) settle.reject(error);
    else settle.resolve();
  };
  void manager.startDeviceScan(
    [BLE_SERVICE_UUID],
    { allowDuplicates: false },
    scanListener(state, onFound, finish),
  );
  state.timer = setTimeout(() => {
    finish();
  }, timeoutMs);
  return finish;
};

export const scanForDevices = (
  manager: BleManager,
  onFound: ScanFound,
  timeoutMs: number,
): ActiveScan => {
  let stop: () => void = () => undefined;
  const promise = new Promise<void>((resolve, reject) => {
    stop = runScan(manager, onFound, timeoutMs, { resolve, reject });
  });
  return {
    promise,
    stop: () => {
      stop();
    },
  };
};
