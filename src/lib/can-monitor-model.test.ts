import type { CanMonitorEntry, CanMonitorFrame } from "@canshift/core/wire";
import {
  EMPTY_CAN_SNAPSHOT,
  RATE_WINDOW_MS,
  applyCanFrame,
  busRateHz,
  sortedCanRows,
  type CanMonitorSnapshot,
} from "./can-monitor-model";

const entry = (overrides: Partial<CanMonitorEntry> = {}): CanMonitorEntry => ({
  id: 0x360,
  extended: false,
  data: [1, 2, 3],
  count: 1,
  ageMs: 0,
  ...overrides,
});

const frame = (
  deviceMs: number,
  entries: CanMonitorEntry[],
): CanMonitorFrame => ({ deviceMs, overflow: false, filtered: false, entries });

const replay = (frames: CanMonitorFrame[]): CanMonitorSnapshot =>
  frames.reduce(applyCanFrame, EMPTY_CAN_SNAPSHOT);

describe("CAN monitor model", () => {
  it("keeps one row per id with its latest data", () => {
    const snapshot = replay([
      frame(100, [entry({ data: [1, 2, 3] })]),
      frame(200, [entry({ data: [1, 9, 3] })]),
    ]);
    const rows = sortedCanRows(snapshot);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.data).toEqual([1, 9, 3]);
    expect(rows[0]?.idLabel).toBe("360");
  });

  it("marks the bytes that changed since the id's last report", () => {
    const snapshot = replay([
      frame(100, [entry({ data: [1, 2, 3] })]),
      frame(200, [entry({ data: [1, 9, 3, 4] })]),
    ]);
    expect(sortedCanRows(snapshot)[0]?.changed).toEqual([
      false,
      true,
      false,
      true,
    ]);
  });

  it("marks every byte of a new id as changed", () => {
    const snapshot = replay([frame(100, [entry({ data: [0, 0] })])]);
    expect(sortedCanRows(snapshot)[0]?.changed).toEqual([true, true]);
  });

  it("derives each id's rate from the frame counts over device time", () => {
    const frames = Array.from({ length: 30 }, (_, tick) =>
      frame(tick * 100, [
        entry({ count: 5 }),
        entry({ id: 0x3e0, count: tick % 2 === 0 ? 1 : 0 }),
      ]),
    );
    const rows = sortedCanRows(replay(frames));
    expect(rows[0]?.rateHz).toBeCloseTo(50, 0);
    expect(rows[1]?.rateHz).toBeCloseTo(5, 0);
    expect(busRateHz(rows)).toBeCloseTo(55, 0);
  });

  it("lets an id that went quiet fall to zero", () => {
    const snapshot = replay([
      frame(0, [entry({ count: 5 })]),
      frame(RATE_WINDOW_MS + 100, [entry({ id: 0x100 })]),
    ]);
    const quiet = sortedCanRows(snapshot).find((row) => row.id === 0x360);
    expect(quiet?.rateHz).toBe(0);
  });

  it("lists standard ids before extended ones, each in id order", () => {
    const snapshot = replay([
      frame(100, [
        entry({ id: 0x18ff50e5, extended: true }),
        entry({ id: 0x3e0 }),
        entry({ id: 0x100 }),
      ]),
    ]);
    expect(sortedCanRows(snapshot).map((row) => row.idLabel)).toEqual([
      "100",
      "3E0",
      "18FF50E5",
    ]);
  });

  it("keeps a standard and an extended id with the same number apart", () => {
    const snapshot = replay([
      frame(100, [entry({ id: 0x100 }), entry({ id: 0x100, extended: true })]),
    ]);
    expect(sortedCanRows(snapshot)).toHaveLength(2);
  });

  it("carries the dash's overflow flag", () => {
    const snapshot = replay([{ ...frame(100, [entry()]), overflow: true }]);
    expect(snapshot.overflow).toBe(true);
  });
});
