import { orderByLastPaired } from "./device-order";
import type { ScanResult } from "../services/ble.service";

const device = (id: string): ScanResult => ({ id, name: id, rssi: -71 });

describe("orderByLastPaired", () => {
  it("puts the last paired device first", () => {
    const ordered = orderByLastPaired(
      [device("CANSHIFT-2C04"), device("CANSHIFT-8F21")],
      "CANSHIFT-8F21",
    );
    expect(ordered.map((d) => d.id)).toEqual([
      "CANSHIFT-8F21",
      "CANSHIFT-2C04",
    ]);
  });

  it("keeps the scan order when the last paired device is absent", () => {
    const devices = [device("CANSHIFT-2C04"), device("CANSHIFT-8F21")];
    expect(orderByLastPaired(devices, "CANSHIFT-0000")).toBe(devices);
  });

  it("keeps the scan order when nothing was paired before", () => {
    const devices = [device("CANSHIFT-2C04")];
    expect(orderByLastPaired(devices, null)).toBe(devices);
  });
});
