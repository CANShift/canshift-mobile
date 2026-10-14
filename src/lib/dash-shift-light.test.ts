import { SHIFT_LIGHT } from "@canshift/core";
import {
  SHIFT_CELL_INDEXES,
  isRedShiftCell,
  shiftLitCount,
} from "./dash-shift-light";

describe("dash shift light", () => {
  it("has the core segment count", () => {
    expect(SHIFT_CELL_INDEXES).toHaveLength(SHIFT_LIGHT.segments);
  });

  it("stays dark below the start rpm and fills at the top of the range", () => {
    expect(shiftLitCount(SHIFT_LIGHT.defaultStartRpm)).toBe(0);
    expect(shiftLitCount(8000)).toBe(SHIFT_LIGHT.segments);
  });

  it("reddens only the last core red segments", () => {
    const red = SHIFT_CELL_INDEXES.filter(isRedShiftCell);
    expect(red).toHaveLength(SHIFT_LIGHT.defaultRedSegments);
    expect(red[red.length - 1]).toBe(SHIFT_LIGHT.segments - 1);
  });
});
