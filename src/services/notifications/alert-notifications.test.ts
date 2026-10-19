import { AppState } from "react-native";
import type { BuiltInAlertSource } from "@canshift/core/wire";
import { startAlertNotifications } from "./alert-notifications";
import {
  acknowledgeAlert,
  muteAlerts,
  publishAlerts,
  switchAlertFeed,
  useAlertsStore,
} from "../../stores/alerts.store";
import { builtInOrigin, type AlertEntry } from "../../lib/alert-model";

const mockSchedule = jest.fn((_request: unknown) => Promise.resolve("id"));
const mockDismiss = jest.fn((_id: string) => Promise.resolve());
const mockToast = jest.fn();

jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: (request: unknown) => mockSchedule(request),
  dismissNotificationAsync: (id: string) => mockDismiss(id),
}));
jest.mock("../../components/ui/toast", () => ({
  Toast: {
    show: (params: unknown) => {
      mockToast(params);
    },
  },
}));

const entry = (source: BuiltInAlertSource, name: string): AlertEntry => ({
  key: source,
  origin: builtInOrigin(source),
  name,
  unit: "bar",
  decimals: 1,
  value: 0.8,
  limit: { value: 1, direction: "below" },
  dashAcknowledged: false,
  activeSeconds: 0,
});

const OIL = entry("oil_pressure", "Oil pressure");
const COOLANT = entry("coolant_temp", "Coolant");

const setAppState = (state: "active" | "background") => {
  Object.defineProperty(AppState, "currentState", {
    value: state,
    configurable: true,
  });
};

const postedIds = () =>
  mockSchedule.mock.calls.map(
    ([request]) => (request as { identifier: string }).identifier,
  );

describe("alert notifications", () => {
  let stop: () => void = () => undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    useAlertsStore.setState({
      feed: "local",
      active: [],
      acknowledged: [],
      muted: [],
    });
    setAppState("background");
    stop = startAlertNotifications();
  });

  afterEach(() => {
    stop();
  });

  it("posts the alert with its reading and limit, with sound, once per onset", () => {
    publishAlerts("local", [OIL]);
    publishAlerts("local", [OIL]);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith({
      identifier: "alert:oil_pressure",
      content: {
        title: "Oil pressure",
        body: "0.8 bar · limit below 1.0",
        sound: true,
      },
      trigger: null,
    });
  });

  it("posts a second alert that starts firing on its own", () => {
    publishAlerts("local", [OIL]);
    publishAlerts("local", [OIL, COOLANT]);
    expect(postedIds()).toEqual(["alert:oil_pressure", "alert:coolant_temp"]);
  });

  it("stays quiet in the foreground, where the takeover shows", () => {
    setAppState("active");
    publishAlerts("local", [OIL]);
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("never posts a muted alert", () => {
    muteAlerts(["oil_pressure"]);
    publishAlerts("local", [OIL]);
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("never posts an alert the dash already acknowledged", () => {
    publishAlerts("local", [{ ...OIL, dashAcknowledged: true }]);
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("clears the notification when the alert is acknowledged", () => {
    publishAlerts("local", [OIL]);
    acknowledgeAlert("oil_pressure");
    expect(mockDismiss).toHaveBeenCalledWith("alert:oil_pressure");
  });

  it("clears the notification when the alert is muted", () => {
    publishAlerts("local", [OIL]);
    muteAlerts(["oil_pressure"]);
    expect(mockDismiss).toHaveBeenCalledWith("alert:oil_pressure");
  });

  it("clears the notification when the condition clears", () => {
    publishAlerts("local", [OIL]);
    publishAlerts("local", []);
    expect(mockDismiss).toHaveBeenCalledWith("alert:oil_pressure");
  });

  it("doesn't post again when the dash takes over an alert the phone raised", () => {
    publishAlerts("local", [OIL]);
    switchAlertFeed("dash");
    publishAlerts("dash", [OIL]);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockDismiss).not.toHaveBeenCalled();
  });

  it("says so once when the phone can't post", async () => {
    mockSchedule.mockImplementationOnce(() =>
      Promise.reject(new Error("denied")),
    );
    publishAlerts("local", [OIL]);
    await new Promise((resolve) => setImmediate(resolve));
    expect(mockToast).toHaveBeenCalledTimes(1);
  });
});
