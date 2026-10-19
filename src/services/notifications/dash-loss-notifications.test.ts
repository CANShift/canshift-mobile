import { AppState } from "react-native";
import {
  notifyDashLost,
  startDashLossNotifications,
} from "./dash-loss-notifications";
import { useDeviceStore } from "../../stores/device.store";

const mockSchedule = jest.fn((_request: unknown) => Promise.resolve("id"));
const mockDismiss = jest.fn((_id: string) => Promise.resolve());

jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: (request: unknown) => mockSchedule(request),
  dismissNotificationAsync: (id: string) => mockDismiss(id),
}));

const setAppState = (state: "active" | "background") => {
  Object.defineProperty(AppState, "currentState", {
    value: state,
    configurable: true,
  });
};

const reconnect = () => {
  useDeviceStore.getState().setDevice("dash", "CANShift");
};

describe("dash loss notifications", () => {
  let stop: () => void = () => undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    useDeviceStore.getState().disconnect();
    setAppState("background");
    stop = startDashLossNotifications();
  });

  afterEach(() => {
    stop();
  });

  it("posts once per drop while the app is in the background", () => {
    notifyDashLost();
    notifyDashLost();
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith({
      identifier: "dash-lost",
      content: {
        title: "Dash disconnected",
        body: "The Bluetooth link to the dash dropped.",
        sound: true,
      },
      trigger: null,
    });
  });

  it("stays quiet in the foreground", () => {
    setAppState("active");
    notifyDashLost();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("clears the notification on reconnect and posts again on the next drop", () => {
    notifyDashLost();
    reconnect();
    expect(mockDismiss).toHaveBeenCalledWith("dash-lost");
    useDeviceStore.getState().disconnect();
    notifyDashLost();
    expect(mockSchedule).toHaveBeenCalledTimes(2);
  });

  it("dismisses nothing on a connection it didn't notify about", () => {
    reconnect();
    expect(mockDismiss).not.toHaveBeenCalled();
  });
});
