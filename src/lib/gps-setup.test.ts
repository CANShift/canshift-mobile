import { GPS_SETUP_VIEWS, gpsSetupView } from "./gps-setup";
import type { GpsFix } from "./gps-fix";
import type { SavedCircuit } from "../services/circuit-storage";
import { CIRCUIT_STRINGS } from "../circuit-strings";

const circuit: SavedCircuit = {
  id: "c-1",
  name: "Lignières",
  line: { a: { lat: 47, lng: 7 }, b: { lat: 47, lng: 7.0004 } },
  forwardBearingDeg: 0,
  savedAt: 1,
};

describe("gpsSetupView", () => {
  it.each<[GpsFix, boolean, keyof typeof GPS_SETUP_VIEWS]>([
    ["denied", false, "denied"],
    ["denied", true, "denied"],
    ["searching", false, "waiting"],
    ["weak", true, "waiting"],
    ["ready", false, "placeLine"],
    ["ready", true, "ready"],
  ])("fix %s with line set %s is %s", (fix, lineSet, step) => {
    expect(gpsSetupView(fix, lineSet, null)).toBe(GPS_SETUP_VIEWS[step]);
  });

  it("offers the nearby circuit instead of placing a line", () => {
    const view = gpsSetupView("ready", false, circuit);
    expect(view.action).toBe("reuseCircuit");
    expect(view.label).toBe(CIRCUIT_STRINGS.use("Lignières"));
    expect(view.enabled).toBe(true);
  });

  it("ignores a nearby circuit once a line is armed or without a fix", () => {
    expect(gpsSetupView("ready", true, circuit)).toBe(GPS_SETUP_VIEWS.ready);
    expect(gpsSetupView("weak", false, circuit)).toBe(GPS_SETUP_VIEWS.waiting);
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
