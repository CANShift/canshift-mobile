import { GPS_READY_ACCURACY_M, fixProgress, gpsFix } from "./gps-fix";

describe("gps fix", () => {
  it("is ready at the accuracy threshold and weak above it", () => {
    expect(gpsFix("granted", GPS_READY_ACCURACY_M)).toBe("ready");
    expect(gpsFix("granted", 18)).toBe("weak");
  });

  it("searches until a position arrives and reports a refusal", () => {
    expect(gpsFix("unknown", null)).toBe("searching");
    expect(gpsFix("denied", 3)).toBe("denied");
  });

  it("fills the progress bar as accuracy improves", () => {
    expect(fixProgress(20)).toBeCloseTo(0.25);
    expect(fixProgress(2)).toBe(1);
    expect(fixProgress(null)).toBe(0);
  });
});
