import { resolveOverlays, type OverlayInputs } from "./overlay-stack";

const QUIET: OverlayInputs = {
  alertHolds: false,
  firmwareUpdate: false,
  reconnectFailed: false,
  reconnecting: false,
  alertStrip: false,
  linkProblem: false,
  noData: false,
  batteryLow: false,
};

const ALL_RAISED: OverlayInputs = {
  alertHolds: true,
  firmwareUpdate: true,
  reconnectFailed: true,
  reconnecting: true,
  alertStrip: true,
  linkProblem: true,
  noData: true,
  batteryLow: true,
};

describe("resolveOverlays", () => {
  it("shows nothing when nothing is raised", () => {
    expect(resolveOverlays(QUIET)).toEqual({
      takeover: "none",
      banner: "none",
    });
  });

  it("puts the critical alert above the reconnect-failed dialog", () => {
    expect(resolveOverlays(ALL_RAISED).takeover).toBe("criticalAlert");
    expect(resolveOverlays({ ...QUIET, reconnectFailed: true }).takeover).toBe(
      "reconnectFailed",
    );
  });

  it("keeps a firmware update above the reconnect-failed dialog, under an alert", () => {
    expect(
      resolveOverlays({ ...QUIET, firmwareUpdate: true, reconnectFailed: true })
        .takeover,
    ).toBe("firmwareUpdate");
    expect(
      resolveOverlays({ ...QUIET, firmwareUpdate: true, alertHolds: true })
        .takeover,
    ).toBe("criticalAlert");
  });

  it.each([
    [{ ...ALL_RAISED }, "reconnecting"],
    [{ ...QUIET, alertStrip: true, noData: true }, "alertStrip"],
    [{ ...QUIET, linkProblem: true, noData: true }, "linkProblem"],
    [{ ...QUIET, noData: true, batteryLow: true }, "noData"],
    [{ ...QUIET, batteryLow: true }, "batteryLow"],
  ] as const)("picks the banner by its fixed priority", (inputs, banner) => {
    expect(resolveOverlays(inputs).banner).toBe(banner);
  });

  it("keeps a banner under a takeover so it is there once the takeover ends", () => {
    expect(
      resolveOverlays({ ...QUIET, alertHolds: true, batteryLow: true }),
    ).toEqual({
      takeover: "criticalAlert",
      banner: "batteryLow",
    });
  });
});
