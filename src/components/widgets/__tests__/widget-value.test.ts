import {
  WIDGET_TEXT_COLORS,
  WIDGET_STALE_TEXT_COLORS,
  WIDGET_ZONE_COLORS,
} from "@canshift/core";
import {
  formatTimerElapsed,
  formatWidgetValue,
  gearColor,
  gearGlyphFor,
  warningState,
} from "../widget-value";
import { signalKeyToSensorKind } from "../../../theme/signal-colors";

describe("formatWidgetValue", () => {
  it("rounds to an integer when decimals is zero", () => {
    expect(formatWidgetValue(94.6, 0)).toBe("95");
    expect(formatWidgetValue(-4.6, 0)).toBe("-5");
  });

  it("fixes to the requested decimals", () => {
    expect(formatWidgetValue(1.234, 2)).toBe("1.23");
    expect(formatWidgetValue(8, 1)).toBe("8.0");
  });
});

describe("signalKeyToSensorKind", () => {
  it("resolves mapped sensor signals", () => {
    expect(signalKeyToSensorKind("r")).toBe("rpm");
    expect(signalKeyToSensorKind("ct")).toBe("coolant_temp");
    expect(signalKeyToSensorKind("bst")).toBe("boost");
  });

  it("returns undefined for signals without a sensor kind", () => {
    expect(signalKeyToSensorKind("s")).toBeUndefined();
    expect(signalKeyToSensorKind("g")).toBeUndefined();
    expect(signalKeyToSensorKind("tps")).toBeUndefined();
  });
});

describe("gearGlyphFor", () => {
  it("maps neutral, reverse and forward gears", () => {
    expect(gearGlyphFor(0)).toBe("N");
    expect(gearGlyphFor(-1)).toBe("R");
    expect(gearGlyphFor(3)).toBe("3");
    expect(gearGlyphFor(3.9)).toBe("3");
  });

  it("shows the neutral glyph when stale", () => {
    expect(gearGlyphFor(undefined)).toBe("N");
  });
});

describe("gearColor", () => {
  it("uses stale text color when the value is missing", () => {
    expect(gearColor(undefined, false)).toBe(WIDGET_STALE_TEXT_COLORS.night);
    expect(gearColor(undefined, true)).toBe(WIDGET_STALE_TEXT_COLORS.day);
  });

  it("paints reverse in the warning color", () => {
    expect(gearColor(-1, false)).toBe(WIDGET_ZONE_COLORS.warning);
  });

  it("paints neutral and forward gears in the text color", () => {
    expect(gearColor(0, false)).toBe(WIDGET_TEXT_COLORS.night);
    expect(gearColor(4, true)).toBe(WIDGET_TEXT_COLORS.day);
  });
});

describe("warningState", () => {
  it("is stale when the value is missing", () => {
    expect(warningState(undefined, 110, false)).toBe("stale");
  });

  it("alarms at or above a high-side threshold", () => {
    expect(warningState(115, 110, false)).toBe("alarm");
    expect(warningState(110, 110, false)).toBe("alarm");
    expect(warningState(95, 110, false)).toBe("idle");
  });

  it("alarms below an inverted low-side threshold", () => {
    expect(warningState(0.8, 1.0, true)).toBe("alarm");
    expect(warningState(1.0, 1.0, true)).toBe("idle");
    expect(warningState(2.5, 1.0, true)).toBe("idle");
  });
});

describe("formatTimerElapsed", () => {
  it("shows SS.mmm below one minute", () => {
    expect(formatTimerElapsed(0, true)).toBe("00.000");
    expect(formatTimerElapsed(1234, true)).toBe("01.234");
    expect(formatTimerElapsed(59_999, true)).toBe("59.999");
  });

  it("switches to MM:SS at one minute and blinks the colon", () => {
    expect(formatTimerElapsed(60_000, true)).toBe("01:00");
    expect(formatTimerElapsed(60_000, false)).toBe("01 00");
    expect(formatTimerElapsed(600_000, true)).toBe("10:00");
  });
});
