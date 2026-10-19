import { alertViews, clearedSources } from "./alert-views";
import type { BuiltInAlertSource } from "@canshift/core/wire";
import { builtInOrigin, type AlertEntry } from "./alert-model";

const entry = (
  source: BuiltInAlertSource,
  activeSeconds: number,
  dashAcknowledged = false,
): AlertEntry => ({
  key: source,
  origin: builtInOrigin(source),
  name: source,
  unit: "",
  decimals: 0,
  value: 1,
  limit: null,
  dashAcknowledged,
  activeSeconds,
});

const OIL = entry("oil_pressure", 12);
const COOLANT = entry("coolant_temp", 3);

describe("alert views", () => {
  it("shows every active alert at once, newest first", () => {
    const views = alertViews({
      active: [OIL, COOLANT],
      acknowledged: [],
      muted: [],
    });
    expect(views.takeover.map((alert) => alert.key)).toEqual([
      "coolant_temp",
      "oil_pressure",
    ]);
    expect(views.strips).toEqual([]);
  });

  it("moves an acknowledged alert to a strip and keeps the other full screen", () => {
    const views = alertViews({
      active: [OIL, COOLANT],
      acknowledged: ["oil_pressure"],
      muted: [],
    });
    expect(views.takeover.map((alert) => alert.key)).toEqual(["coolant_temp"]);
    expect(views.strips).toEqual([{ entry: OIL, kind: "acknowledged" }]);
  });

  it("follows an acknowledgement made on the dash", () => {
    const acked = entry("oil_pressure", 12, true);
    expect(
      alertViews({ active: [acked], acknowledged: [], muted: [] }).strips,
    ).toEqual([{ entry: acked, kind: "acknowledged" }]);
  });

  it("keeps a muted signal off the takeover while a new one still takes over", () => {
    const views = alertViews({
      active: [OIL, COOLANT],
      acknowledged: [],
      muted: ["oil_pressure"],
    });
    expect(views.takeover.map((alert) => alert.key)).toEqual(["coolant_temp"]);
    expect(views.strips).toEqual([{ entry: OIL, kind: "muted" }]);
  });

  it("finds the alerts that cleared", () => {
    expect(clearedSources([OIL, COOLANT], [COOLANT])).toEqual([OIL]);
  });
});
