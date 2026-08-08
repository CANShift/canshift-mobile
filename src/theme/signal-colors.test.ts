import { getSignalColor, signalRampColor } from "./signal-colors";

describe("getSignalColor", () => {
  it("derives a color for compact keys mapped to a SensorKind", () => {
    for (const key of ["r", "ct", "ot", "op", "iat", "bst", "lam"]) {
      expect(getSignalColor(key)).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("falls back to the mobile palette for non-sensor keys", () => {
    expect(getSignalColor("tps")).toBe("#FFD700");
    expect(getSignalColor("map")).toBe("#44AAFF");
    expect(getSignalColor("fp")).toBe("#FF88BB");
    expect(getSignalColor("s")).toBe("#CCCCCC");
    expect(getSignalColor("g")).toBe("#888888");
    expect(getSignalColor("bat")).toBe("#AAFFAA");
  });

  it("returns a sane default color for unknown keys", () => {
    expect(getSignalColor("nope_xyz")).toMatch(/^#[0-9A-F]{6}$/i);
  });
});

describe("signalRampColor", () => {
  it("colours near-stoichiometric lambda green, not rich-red (scales λ to AFR)", () => {
    expect(signalRampColor("lam", 0.99)?.toUpperCase()).toBe("#44CC66");
  });

  it("colours a genuinely rich lambda red", () => {
    expect(signalRampColor("lam", 0.71)?.toUpperCase()).toBe("#CC3333");
  });

  it("returns null for a signal without a sensor ramp", () => {
    expect(signalRampColor("tps", 50)).toBeNull();
  });
});
