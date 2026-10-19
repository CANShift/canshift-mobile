import { startAlertCues } from "./alert-cues";
import { startAlertNotices } from "./alert-notices";
import {
  publishAlerts,
  acknowledgeAlert,
  useAlertsStore,
} from "../stores/alerts.store";
import type { BuiltInAlertSource } from "@canshift/core/wire";
import { builtInOrigin, type AlertEntry } from "../lib/alert-model";

const mockPlay = jest.fn();
const mockHaptic = jest.fn(() => Promise.resolve());
const mockToast = jest.fn();

jest.mock("expo-audio", () => ({
  createAudioPlayer: () => ({
    play: mockPlay,
    seekTo: () => Promise.resolve(),
  }),
  setAudioModeAsync: () => Promise.resolve(),
}));
jest.mock("expo-haptics", () => ({
  notificationAsync: () => mockHaptic(),
  NotificationFeedbackType: { Error: "error" },
}));
jest.mock("../components/ui/toast", () => ({
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
  unit: "",
  decimals: 0,
  value: 1,
  limit: null,
  dashAcknowledged: false,
  activeSeconds: 0,
});

const OIL = entry("oil_pressure", "Oil pressure");
const COOLANT = entry("coolant_temp", "Coolant");

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("alert cues and notices", () => {
  let stops: (() => void)[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    useAlertsStore.setState({
      feed: "local",
      active: [],
      acknowledged: [],
      muted: [],
    });
    stops = [startAlertCues(), startAlertNotices()];
  });

  afterEach(() => {
    stops.forEach((stop) => {
      stop();
    });
  });

  it("plays the sound and the haptic when a new alert takes over", async () => {
    publishAlerts("local", [OIL]);
    await flush();
    expect(mockPlay).toHaveBeenCalledTimes(1);
    expect(mockHaptic).toHaveBeenCalledTimes(1);
  });

  it("stays quiet for a muted signal and cues again for a different one", async () => {
    useAlertsStore.setState({ muted: ["oil_pressure"] });
    publishAlerts("local", [OIL]);
    await flush();
    expect(mockPlay).not.toHaveBeenCalled();
    publishAlerts("local", [OIL, COOLANT]);
    await flush();
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it("doesn't cue again when an alert is only acknowledged", async () => {
    publishAlerts("local", [OIL]);
    await flush();
    acknowledgeAlert("oil_pressure");
    await flush();
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it("says when a signal is back to normal", () => {
    publishAlerts("local", [OIL]);
    publishAlerts("local", []);
    expect(mockToast).toHaveBeenCalledWith({
      type: "success",
      text1: "Oil pressure is back to normal.",
    });
  });
});
