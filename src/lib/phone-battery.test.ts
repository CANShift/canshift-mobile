import {
  LOGGING_CUTOFF_PERCENT,
  isPhoneBatteryLow,
  phoneBatteryStatus,
  toBatteryPercent,
} from "./phone-battery";

describe("toBatteryPercent", () => {
  it("converts a fraction to a rounded percentage", () => {
    expect(toBatteryPercent(0.08)).toBe(8);
    expect(toBatteryPercent(0.826)).toBe(83);
    expect(toBatteryPercent(1)).toBe(100);
  });

  it("returns null when the platform cannot report a level", () => {
    expect(toBatteryPercent(-1)).toBeNull();
    expect(toBatteryPercent(Number.NaN)).toBeNull();
  });
});

describe("phoneBatteryStatus", () => {
  it("cuts logging off strictly below the cut-off", () => {
    expect(phoneBatteryStatus(LOGGING_CUTOFF_PERCENT - 1)).toBe("cutoff");
    expect(phoneBatteryStatus(0)).toBe("cutoff");
    expect(phoneBatteryStatus(LOGGING_CUTOFF_PERCENT)).toBe("low");
  });

  it("warns from the low threshold down", () => {
    expect(phoneBatteryStatus(20)).toBe("low");
    expect(phoneBatteryStatus(8)).toBe("low");
    expect(phoneBatteryStatus(21)).toBe("ok");
    expect(phoneBatteryStatus(100)).toBe("ok");
  });

  it("stays silent while the level is unknown", () => {
    expect(phoneBatteryStatus(null)).toBe("ok");
    expect(isPhoneBatteryLow(null)).toBe(false);
    expect(isPhoneBatteryLow(8)).toBe(true);
  });
});
