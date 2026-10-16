import {
  acknowledgeAlert,
  muteAlerts,
  publishAlerts,
  reopenAlert,
  switchAlertFeed,
  unmuteAlert,
  useAlertsStore,
} from "./alerts.store";
import type { AlertEntry } from "../lib/alert-model";

const OIL: AlertEntry = {
  source: "oil_pressure",
  name: "Oil pressure",
  unit: "bar",
  decimals: 1,
  value: 0.8,
  limit: { value: 1, direction: "below" },
  dashAcknowledged: false,
  activeSeconds: 1,
};

describe("alerts store", () => {
  beforeEach(() => {
    useAlertsStore.setState({
      feed: "local",
      active: [],
      acknowledged: [],
      muted: [],
    });
  });

  it("forgets an acknowledgement once the alert clears, so a new episode takes over again", () => {
    publishAlerts("local", [OIL]);
    acknowledgeAlert("oil_pressure");
    publishAlerts("local", []);
    expect(useAlertsStore.getState().acknowledged).toEqual([]);
  });

  it("reopens an acknowledged alert on Show", () => {
    publishAlerts("local", [OIL]);
    acknowledgeAlert("oil_pressure");
    reopenAlert("oil_pressure");
    expect(useAlertsStore.getState().acknowledged).toEqual([]);
  });

  it("keeps a mute for the whole app session, across episodes and feeds", () => {
    muteAlerts(["oil_pressure"]);
    publishAlerts("local", []);
    switchAlertFeed("dash");
    expect(useAlertsStore.getState().muted).toEqual(["oil_pressure"]);
    unmuteAlert("oil_pressure");
    expect(useAlertsStore.getState().muted).toEqual([]);
  });

  it("ignores frames from the feed that isn't in charge", () => {
    switchAlertFeed("dash");
    publishAlerts("local", [OIL]);
    expect(useAlertsStore.getState().active).toEqual([]);
  });
});
