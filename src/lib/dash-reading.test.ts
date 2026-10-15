import { barRangeFor, dashReading } from "./dash-reading";

describe("dashReading", () => {
  it("formats a live reading with the signal's decimals", () => {
    expect(dashReading("bat", 13.84, true)).toEqual({
      text: "13.8",
      tone: "normal",
      barFraction: 0.73,
    });
  });

  it("renders the gear as a glyph", () => {
    expect(dashReading("g", 0, true).text).toBe("N");
    expect(dashReading("g", 4, true).text).toBe("4");
  });

  it("turns a reading past its danger threshold to danger", () => {
    expect(dashReading("op", 0.4, true).tone).toBe("danger");
    expect(dashReading("op", 4, true).tone).toBe("normal");
  });

  it("turns a battery reading to danger on either side of its band", () => {
    expect(dashReading("bat", 11, true).tone).toBe("danger");
    expect(dashReading("bat", 16, true).tone).toBe("danger");
  });

  it("dashes a held value once the link is not live", () => {
    expect(dashReading("r", 4000, false)).toEqual({
      text: "- - - -",
      tone: "stale",
      barFraction: 0,
    });
  });

  it("fills the bar against the signal's range, clamped", () => {
    expect(dashReading("tps", 46, true).barFraction).toBeCloseTo(0.46);
    expect(dashReading("r", 99_999, true).barFraction).toBe(1);
  });
});

describe("barRangeFor", () => {
  it("has no range for a signal without a known scale", () => {
    expect(barRangeFor("fp")).toBeNull();
    expect(barRangeFor("s")).toBeNull();
  });
});
