import { GPS_SETUP_VIEWS, gpsSetupStep } from "./gps-setup";
import type { GpsFix } from "./gps-fix";

describe("gpsSetupStep", () => {
  it.each<[GpsFix, boolean, string]>([
    ["denied", false, "denied"],
    ["denied", true, "denied"],
    ["searching", false, "waiting"],
    ["weak", true, "waiting"],
    ["ready", false, "placeLine"],
    ["ready", true, "ready"],
  ])("fix %s with line set %s is %s", (fix, lineSet, step) => {
    expect(gpsSetupStep(fix, lineSet)).toBe(step);
  });
});

describe("GPS_SETUP_VIEWS", () => {
  it("offers exactly one primary action per step", () => {
    expect(GPS_SETUP_VIEWS.denied.action).toBe("openSettings");
    expect(GPS_SETUP_VIEWS.waiting.action).toBe("start");
    expect(GPS_SETUP_VIEWS.placeLine.action).toBe("setLine");
    expect(GPS_SETUP_VIEWS.ready.action).toBe("start");
  });

  it("only blocks the action while the fix is missing", () => {
    expect(GPS_SETUP_VIEWS.waiting.enabled).toBe(false);
    expect(GPS_SETUP_VIEWS.denied.enabled).toBe(true);
    expect(GPS_SETUP_VIEWS.placeLine.enabled).toBe(true);
    expect(GPS_SETUP_VIEWS.ready.enabled).toBe(true);
  });

  it("hides the line row when location is off", () => {
    expect(GPS_SETUP_VIEWS.denied.showsLine).toBe(false);
    expect(GPS_SETUP_VIEWS.ready.showsLine).toBe(true);
  });
});
