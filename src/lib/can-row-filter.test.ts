import type { CanMonitorFrame } from "@canshift/core/wire";
import {
  EMPTY_CAN_SNAPSHOT,
  applyCanFrame,
  sortedCanRows,
} from "./can-monitor-model";
import { filterCanRows } from "./can-row-filter";

const FRAME: CanMonitorFrame = {
  deviceMs: 100,
  overflow: false,
  filtered: false,
  entries: [
    { id: 0x3e0, extended: false, data: [0x0b, 0x5e], count: 1, ageMs: 0 },
    { id: 0x07e, extended: false, data: [0xaa], count: 1, ageMs: 0 },
    { id: 0x360, extended: false, data: [0x0d, 0x7a], count: 1, ageMs: 0 },
  ],
};

const rows = sortedCanRows(applyCanFrame(EMPTY_CAN_SNAPSHOT, FRAME));

const ids = (filter: string): string[] =>
  filterCanRows(rows, filter).map((row) => row.idLabel);

describe("CAN row filter", () => {
  it("shows every row without a filter", () => {
    expect(ids("  ")).toEqual(["07E", "360", "3E0"]);
  });

  it.each([
    ["an id prefix", "3e", ["3E0"]],
    ["a hex-prefixed id", "0x360", ["360"]],
    ["an id without its leading zero", "7e", ["07E"]],
    ["a data byte", "5E", ["3E0"]],
    ["data bytes across a space", "0d 7a", ["360"]],
  ])("matches %s", (_name, filter, expected) => {
    expect(ids(filter)).toEqual(expected);
  });

  it("returns nothing when no row matches", () => {
    expect(ids("FFF")).toEqual([]);
  });
});
