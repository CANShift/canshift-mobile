import { isWarningTripped, sensorDefaultDangerThreshold } from "@canshift/core";
import { fromSensorKindValue, toSensorKindValue } from "../sensor-units";
import { signalKeyToSensorKind } from "../signal-colors";

const dangerFor = (key: string, value: number): boolean => {
  const kind = signalKeyToSensorKind(key);
  if (kind === undefined) return false;
  const danger = sensorDefaultDangerThreshold(kind);
  return isWarningTripped(
    toSensorKindValue(key, value),
    danger.threshold,
    danger.invertLogic,
  );
};

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
    expect(dangerFor("lam", 0.99)).toBe(false);
    expect(dangerFor("lam", 1.0)).toBe(false);
    expect(dangerFor("lam", 1.02)).toBe(false);
  });

  it("still flags a genuinely rich mixture", () => {
    expect(dangerFor("lam", 0.7)).toBe(true);
  });

  it("keeps coolant behaviour unchanged", () => {
    expect(dangerFor("ct", 105)).toBe(false);
    expect(dangerFor("ct", 115)).toBe(true);
  });
});
