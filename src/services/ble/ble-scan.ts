import type { BleManager } from "react-native-ble-plx";
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

export const scanForDevices = (
  manager: BleManager,
  onFound: (device: ScanResult) => void,
  timeoutMs: number,
): ActiveScan => {
  let stop: () => void = () => undefined;
  const promise = new Promise<void>((resolve, reject) => {
    const found = new Set<string>();
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const finish = (error?: Error): void => {
      if (settled) return;
      settled = true;
      if (timer !== null) clearTimeout(timer);
      void manager.stopDeviceScan();
      if (error) reject(error);
      else resolve();
    };
    stop = finish;

    void manager.startDeviceScan(
      [BLE_SERVICE_UUID],
      { allowDuplicates: false },
      (error, device) => {
        if (settled) return;
        if (error) {
          finish(error);
          return;
        }
        if (device?.name?.includes(BLE_DEVICE_NAME) && !found.has(device.id)) {
          found.add(device.id);
          onFound({
            id: device.id,
            name: device.name,
            rssi: device.rssi ?? null,
          });
        }
      },
    );

    timer = setTimeout(() => {
      finish();
    }, timeoutMs);
  });
  return {
    promise,
    stop: () => {
      stop();
    },
  };
};
