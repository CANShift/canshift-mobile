import type { SignalValues, TelemetrySample } from "../stores/telemetry.store";
import { STALE_PLACEHOLDER } from "@canshift/core";
import { SIGNAL_RANGE, buildPoints, formatNumber } from "./graph-math";

describe("formatNumber", () => {
  it("renders the stale placeholder for undefined", () => {
    expect(formatNumber("r", undefined)).toBe(STALE_PLACEHOLDER);
  });

  it("rounds zero-decimal signals", () => {
    expect(formatNumber("r", 6543.7)).toBe("6544");
    expect(formatNumber("map", 250.4)).toBe("250");
  });

  it("uses the signal decimal count for fractional signals", () => {
    expect(formatNumber("lam", 0.923)).toBe("0.92");
  });
});

describe("buildPoints", () => {
  const sample = (t: number, v: SignalValues): TelemetrySample => ({ t, v });

  it("projects sample time to x across the window and inverts y for value", () => {
    const pts = buildPoints([sample(50, { r: 4000 })], "r", 0, 100, 200, 100);
    expect(pts).toBe("100.0,50.0");
  });

  it("clamps values outside the range to the [0,1] band", () => {
    const over = buildPoints([sample(0, { r: 99999 })], "r", 0, 100, 100, 100);
    expect(over).toBe("0.0,0.0");
    const under = buildPoints([sample(0, { r: -50 })], "r", 0, 100, 100, 100);
    expect(under).toBe("0.0,100.0");
  });

  it("skips out-of-window and non-finite samples", () => {
    const buffer = [
      sample(-10, { r: 4000 }),
      sample(10, { r: Number.NaN }),
      sample(20, {}),
      sample(50, { r: 4000 }),
    ];
    expect(buildPoints(buffer, "r", 0, 100, 200, 100)).toBe("100.0,50.0");
  });
});

describe("SIGNAL_RANGE", () => {
  it("covers the default graph signals", () => {
    expect(SIGNAL_RANGE.r).toEqual({ min: 0, max: 8000 });
    expect(SIGNAL_RANGE.lam).toEqual({ min: 0.6, max: 1.4 });
  });
});
