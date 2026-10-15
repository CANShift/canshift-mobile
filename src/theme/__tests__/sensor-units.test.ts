import { isSignalInDanger } from "../../lib/signal-danger";
import { fromSensorKindValue, toSensorKindValue } from "../sensor-units";

describe("lambda is compared in AFR units", () => {
  it("leaves non-lambda signals untouched", () => {
    expect(toSensorKindValue("ct", 105)).toBe(105);
    expect(fromSensorKindValue("ct", 105)).toBe(105);
  });

  it("round-trips lambda through AFR", () => {
    expect(toSensorKindValue("lam", 1)).toBeCloseTo(14.7, 5);
    expect(fromSensorKindValue("lam", 14.7)).toBeCloseTo(1, 5);
  });

  it("does not flag stoich cruise as danger", () => {
    expect(isSignalInDanger("lam", 0.99)).toBe(false);
    expect(isSignalInDanger("lam", 1.0)).toBe(false);
    expect(isSignalInDanger("lam", 1.02)).toBe(false);
  });

  it("still flags a genuinely rich mixture", () => {
    expect(isSignalInDanger("lam", 0.7)).toBe(true);
  });

  it("keeps coolant behaviour unchanged", () => {
    expect(isSignalInDanger("ct", 105)).toBe(false);
    expect(isSignalInDanger("ct", 115)).toBe(true);
  });
});
