import { LAYOUT_GRID } from "@canshift/core";
import { SIGNAL_META } from "../constants/ble";
import { DASH_PAGES, dashPageById } from "./dash-pages";
import { barRangeFor } from "./dash-reading";

const allWidgets = DASH_PAGES.flatMap((page) => page.widgets);

describe("DASH_PAGES", () => {
  it("only binds signals the BLE telemetry stream carries", () => {
    for (const widget of allWidgets) {
      expect(SIGNAL_META[widget.signal]).toBeDefined();
    }
  });

  it("keeps every span inside the twelve-column grid", () => {
    for (const widget of allWidgets) {
      expect(widget.span).toBeGreaterThan(0);
      expect(widget.span).toBeLessThanOrEqual(LAYOUT_GRID.COLUMNS);
    }
  });

  it("draws a bar only where the signal has a range", () => {
    for (const widget of allWidgets.filter((w) => w.bar === true)) {
      expect(barRangeFor(widget.signal)).not.toBeNull();
    }
  });

  it("declares the shift light on the Track page only", () => {
    expect(
      DASH_PAGES.filter((page) => page.shiftLight).map((page) => page.id),
    ).toEqual(["track"]);
  });

  it("finds a page by id", () => {
    expect(dashPageById("engine").name).toBe("Engine");
  });
});
