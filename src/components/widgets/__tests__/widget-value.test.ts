import {
  formatTimerElapsed,
  formatWidgetValue,
  gearGlyphFor,
  heldPlaceholder,
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

describe("heldPlaceholder", () => {
  it("dashes the held reading digit for digit", () => {
    expect(heldPlaceholder(4000, 0)).toBe("- - - -");
    expect(heldPlaceholder(88, 0)).toBe("- -");
    expect(heldPlaceholder(13.8, 1)).toBe("- - -");
  });

  it("falls back to the shared placeholder once the values are cleared", () => {
    expect(heldPlaceholder(undefined, 0)).toBe("- -");
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
