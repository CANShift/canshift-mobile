import { sensorDefaultDangerBand } from "@canshift/core";
import { isSignalInDanger } from "./signal-danger";

const BAT = sensorDefaultDangerBand("battery_volts");
const BAT_MIN = BAT.below ?? 0;
const BAT_MAX = BAT.above ?? 0;

describe("isSignalInDanger", () => {
  it("flags battery undervolt at and below the low side, as the dash does", () => {
    expect(isSignalInDanger("bat", BAT_MIN - 0.1)).toBe(true);
    expect(isSignalInDanger("bat", BAT_MIN)).toBe(true);
    expect(isSignalInDanger("bat", BAT_MIN + 0.1)).toBe(false);
  });

  it("uses the dash battery limits", () => {
    expect(BAT).toEqual({ below: 11.5, above: 16 });
  });

  it("flags battery overvolt at the high side", () => {
    expect(isSignalInDanger("bat", BAT_MAX)).toBe(true);
    expect(isSignalInDanger("bat", BAT_MAX - 0.1)).toBe(false);
  });

  it("leaves a charging battery clear", () => {
    expect(isSignalInDanger("bat", 13.8)).toBe(false);
  });

  it("never flags a signal without a sensor kind", () => {
    expect(isSignalInDanger("tps", 100)).toBe(false);
  });
});
