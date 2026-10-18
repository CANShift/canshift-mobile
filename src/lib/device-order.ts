import type { ScanResult } from "../services/ble.service";

export const orderByLastPaired = (
  devices: readonly ScanResult[],
  lastPairedId: string | null,
): readonly ScanResult[] => {
  if (lastPairedId === null) return devices;
  const lastPaired = devices.find((device) => device.id === lastPairedId);
  if (lastPaired === undefined) return devices;
  return [
    lastPaired,
    ...devices.filter((device) => device.id !== lastPairedId),
  ];
};
