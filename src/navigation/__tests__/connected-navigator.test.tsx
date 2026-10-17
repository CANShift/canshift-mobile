import * as React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { act, fireEvent, render } from "@testing-library/react-native";
import ConnectedNavigator from "../ConnectedNavigator";
import { useDeviceStore } from "../../stores/device.store";
import { useReconnectStore } from "../../stores/reconnect.store";
import { useSignalsStore } from "../../stores/signals.store";
import { usePhoneBatteryStore } from "../../stores/phone-battery.store";
import { STRINGS } from "../../strings";
import { useAlertsStore } from "../../stores/alerts.store";
import { entryFromDash } from "../../lib/alert-model";

const PORTRAIT = { width: 390, height: 844, scale: 3, fontScale: 1 };
const LANDSCAPE = { width: 844, height: 390, scale: 3, fontScale: 1 };
let mockWindow = PORTRAIT;

jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: () => mockWindow,
}));

const stubScreen = (label: string) => () => <Text>{label}</Text>;

jest.mock("../../screens/LiveScreen", () => stubScreen("live-screen"));
jest.mock("../../screens/GraphScreen", () => stubScreen("graph-screen"));
jest.mock("../../screens/LapsScreen", () => stubScreen("laps-screen"));
jest.mock("../DeviceStack", () => stubScreen("device-screen"));
jest.mock("../../services/ble.service", () => ({
  cancelReconnect: jest.fn(),
  tryReconnectLastDevice: jest.fn(() => Promise.resolve(false)),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderShell = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <NavigationContainer>
        <ConnectedNavigator />
      </NavigationContainer>
    </SafeAreaProvider>,
  );

const initial = {
  device: useDeviceStore.getState(),
  reconnect: useReconnectStore.getState(),
  signals: useSignalsStore.getState(),
  battery: usePhoneBatteryStore.getState(),
};

describe("connected shell", () => {
  beforeEach(() => {
    mockWindow = PORTRAIT;
    useAlertsStore.setState({
      feed: "local",
      active: [],
      acknowledged: [],
      muted: [],
    });
    useDeviceStore.setState(initial.device, true);
    useReconnectStore.setState(initial.reconnect, true);
    useSignalsStore.setState(initial.signals, true);
    usePhoneBatteryStore.setState(initial.battery, true);
    useDeviceStore.getState().setDevice("dash-1", "CANShift-4F2A");
    useDeviceStore.getState().setMode("ble");
  });

  it("names the four tabs and opens on Live", async () => {
    const view = await renderShell();
    for (const tab of ["Live", "Graph", "Laps", "Device"]) {
      expect(view.getByRole("tab", { name: tab })).toBeTruthy();
    }
    expect(view.getByText("live-screen")).toBeTruthy();
  });

  it("switches tab on press", async () => {
    const view = await renderShell();
    await act(() => {
      void fireEvent.press(view.getByRole("tab", { name: "Laps" }));
    });
    expect(view.getByText("laps-screen")).toBeTruthy();
  });

  it("shows the link and the dash name in the header", async () => {
    const view = await renderShell();
    expect(view.getByText(STRINGS.link.connected)).toBeTruthy();
    expect(view.getByText("· CANShift-4F2A")).toBeTruthy();
  });

  it("badges a demo session", async () => {
    useDeviceStore.getState().setMode("sim");
    const view = await renderShell();
    expect(view.getByText(STRINGS.badges.demo)).toBeTruthy();
    expect(view.getByText(STRINGS.link.demo)).toBeTruthy();
  });

  it("shows NO DATA once the stream went stale while linked", async () => {
    useSignalsStore.setState({ staleSinceMs: Date.now(), isLive: false });
    const view = await renderShell();
    expect(view.getByText(STRINGS.banners.noDataTag)).toBeTruthy();
  });

  it("puts the reconnecting banner ahead of NO DATA and battery low", async () => {
    useSignalsStore.setState({ staleSinceMs: Date.now(), isLive: false });
    usePhoneBatteryStore.setState({ levelPercent: 9 });
    useReconnectStore.getState().start("dash-1", 5);
    useReconnectStore.getState().setAttempt(2);
    const view = await renderShell();
    expect(view.getByText(STRINGS.banners.reconnectingTitle)).toBeTruthy();
    expect(view.getByText("Values are paused. Try 2 of 5.")).toBeTruthy();
    expect(view.queryByText(STRINGS.banners.noDataTag)).toBeNull();
    expect(view.getByText(STRINGS.link.reconnecting)).toBeTruthy();
  });

  it("puts the acknowledged alert strip ahead of NO DATA on every tab", async () => {
    useSignalsStore.setState({ staleSinceMs: Date.now(), isLive: false });
    useAlertsStore.setState({
      feed: "dash",
      active: [
        entryFromDash({
          source: "oil_pressure",
          configuredIndex: null,
          signal: "oil_press_bar",
          value: 0.8,
          limit: { value: 1, direction: "below" },
          acknowledged: true,
          displayed: true,
          activeSeconds: 4,
        }),
      ],
      acknowledged: [],
      muted: [],
    });
    const view = await renderShell();
    expect(view.getByText(STRINGS.alert.stripAcknowledgedActive)).toBeTruthy();
    expect(view.queryByText(STRINGS.banners.noDataTag)).toBeNull();
  });

  it("dismisses the battery banner until the next threshold", async () => {
    usePhoneBatteryStore.setState({ levelPercent: 9 });
    const view = await renderShell();
    expect(view.getByText("Phone battery 9%.")).toBeTruthy();
    await act(() => {
      void fireEvent.press(view.getByLabelText(STRINGS.banners.dismiss));
    });
    expect(view.queryByText("Phone battery 9%.")).toBeNull();
  });

  it("turns the tab bar into a rail with the link status in landscape", async () => {
    mockWindow = LANDSCAPE;
    const view = await renderShell();
    expect(view.getByText(STRINGS.rail.linked)).toBeTruthy();
    expect(view.queryByText(STRINGS.link.connected)).toBeNull();
    expect(view.getByRole("tab", { name: "Live" })).toBeTruthy();
  });
});
