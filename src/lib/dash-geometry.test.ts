import { CANVAS, LAYOUT_GRID } from "@canshift/core";
import { dashGutter, dashScale, spanWidth } from "./dash-geometry";

describe("dashScale", () => {
  it("scales the panel to the width in portrait", () => {
    const content = CANVAS.WIDTH - LAYOUT_GRID.FRAME_PADDING * 2;
    expect(dashScale({ width: content * 2, height: 2000 }, false)).toBe(2);
  });

  it("fits the panel inside the area in landscape", () => {
    const contentHeight = CANVAS.HEIGHT - LAYOUT_GRID.FRAME_PADDING * 2;
    expect(dashScale({ width: 2000, height: contentHeight * 1.5 }, true)).toBe(
      1.5,
    );
  });

  it("is zero before the area is measured", () => {
    expect(dashScale({ width: 0, height: 0 }, false)).toBe(0);
  });
});

describe("spanWidth", () => {
  it("fills the content width at twelve columns", () => {
    const scale = 1.25;
    const content = (CANVAS.WIDTH - LAYOUT_GRID.FRAME_PADDING * 2) * scale;
    expect(spanWidth(LAYOUT_GRID.COLUMNS, scale)).toBeLessThanOrEqual(content);
    expect(spanWidth(LAYOUT_GRID.COLUMNS, scale)).toBeGreaterThan(content - 1);
  });

  it("never lets two spans that make a row overflow it", () => {
    const scale = 1.2575;
    const row = spanWidth(7, scale) + dashGutter(scale) + spanWidth(5, scale);
    expect(row).toBeLessThanOrEqual(spanWidth(LAYOUT_GRID.COLUMNS, scale) + 1);
  });

  it("matches the device column at scale 1", () => {
    expect(spanWidth(6, 1)).toBe(149);
  });
});
