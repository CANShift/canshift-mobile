import { entryFromDash } from "./alert-model";
import {
  alertLimit,
  alertSince,
  alertSpoken,
  alertStripLine,
  alertTitle,
} from "./alert-text";

const OIL = entryFromDash({
  source: "oil_pressure",
  signal: "oil_press_bar",
  value: 0.8,
  limit: { value: 1, direction: "below" },
  acknowledged: false,
  displayed: true,
  activeSeconds: 12,
});

describe("alert text", () => {
  it("names the signal and the side it crossed", () => {
    expect(alertTitle(OIL)).toBe("OIL PRESSURE LOW");
    expect(alertLimit(OIL)).toBe("Limit: below 1.0 bar");
  });

  it("writes the time since onset as m:ss", () => {
    expect(alertSince(12)).toBe("0:12");
    expect(alertSince(75)).toBe("1:15");
  });

  it("writes the strip line in sentence case", () => {
    expect(alertStripLine(OIL)).toBe("Oil pressure low · 0.8 bar");
  });

  it("reads the whole alert for VoiceOver", () => {
    expect(alertSpoken(OIL)).toBe(
      "OIL PRESSURE LOW, 0.8 bar, Limit: below 1.0 bar",
    );
  });

  it("names a configured alert after its signal", () => {
    const egt = entryFromDash({
      source: "configured",
      signal: "turbo_inlet_temp",
      value: 950,
      limit: { value: 900, direction: "above" },
      acknowledged: true,
      displayed: false,
      activeSeconds: 3,
    });
    expect(alertTitle(egt)).toBe("TURBO INLET TEMP HIGH");
    expect(egt.dashAcknowledged).toBe(true);
  });
});
