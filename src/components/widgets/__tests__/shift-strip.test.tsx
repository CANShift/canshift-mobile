import * as React from "react";
import { render } from "@testing-library/react-native";
import ShiftStrip, {
  SHIFT_RPM_MAX,
  SHIFT_SEGMENTS,
  shiftLitCount,
  shiftSegmentColor,
} from "../ShiftStrip";
import { Colors } from "../../../theme";

describe("shiftLitCount", () => {
  it("is empty at zero and full at the redline max", () => {
    expect(shiftLitCount(0)).toBe(0);
    expect(shiftLitCount(SHIFT_RPM_MAX)).toBe(SHIFT_SEGMENTS);
  });

  it("clamps out-of-range revs to the strip length", () => {
    expect(shiftLitCount(-500)).toBe(0);
    expect(shiftLitCount(SHIFT_RPM_MAX * 3)).toBe(SHIFT_SEGMENTS);
  });

  it("scales linearly across the strip", () => {
    expect(shiftLitCount(SHIFT_RPM_MAX / 2)).toBe(SHIFT_SEGMENTS / 2);
  });
});

describe("shiftSegmentColor", () => {
  it("runs green → amber → red across the strip", () => {
    expect(shiftSegmentColor(0)).toBe(Colors.success);
    expect(shiftSegmentColor(11)).toBe(Colors.warning);
    expect(shiftSegmentColor(SHIFT_SEGMENTS - 1)).toBe(Colors.danger);
  });
});

describe("ShiftStrip", () => {
  it("renders without a live signal", async () => {
    const { toJSON } = await render(<ShiftStrip />);
    expect(toJSON()).toBeTruthy();
  });
});
