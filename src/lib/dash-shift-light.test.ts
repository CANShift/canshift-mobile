import { SHIFT_LIGHT } from "@canshift/core/widget-metrics";
import {
  SHIFT_CELL_INDEXES,
  shiftCellZone,
  shiftLitCount,
} from "./dash-shift-light";

describe("shift light", () => {
  it("has the core segment count", () => {
    expect(SHIFT_CELL_INDEXES).toHaveLength(SHIFT_LIGHT.segments);
  });

  it("stays dark below the start rpm and fills at the top of the range", () => {
    expect(shiftLitCount(SHIFT_LIGHT.defaultStartRpm)).toBe(0);
    expect(shiftLitCount(8000)).toBe(SHIFT_LIGHT.segments);
  });

  it("splits the bar into six green, three orange and three red cells", () => {
    const zones = SHIFT_CELL_INDEXES.map(shiftCellZone);
    expect(zones.filter((zone) => zone === "green")).toHaveLength(6);
    expect(zones.filter((zone) => zone === "orange")).toHaveLength(3);
    expect(zones.filter((zone) => zone === "red")).toHaveLength(3);
    expect(zones[zones.length - 1]).toBe("red");
  });
});
