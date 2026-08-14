import * as React from "react";
import { render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DeviceScreen from "./DeviceScreen";
import type { RootStackParamList } from "../navigation";
import { usePhoneBatteryStore } from "../stores/phone-battery.store";
import { useTrackSessionStore } from "../stores/track-session.store";

const navigation = {
  goBack: jest.fn(),
  replace: jest.fn(),
} as unknown as NativeStackNavigationProp<RootStackParamList, "Device">;

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <DeviceScreen navigation={navigation} />
    </SafeAreaProvider>,
  );

const KICKER = "PHONE BATTERY LOW";
const STOP_LOGGING = "STOP LOGGING NOW";

describe("DeviceScreen", () => {
  beforeEach(() => {
    usePhoneBatteryStore.setState({ levelPercent: null });
    useTrackSessionStore.setState({ recording: false, sessionStartMs: 0 });
  });

  it("renders the device and application facts", async () => {
    const { getByText } = await renderScreen();
    expect(getByText("Device")).toBeTruthy();
    expect(getByText("Config schema")).toBeTruthy();
    expect(getByText("Firmware")).toBeTruthy();
  });

  it("hides the disconnect action when not connected", async () => {
    const { queryByLabelText } = await renderScreen();
    expect(queryByLabelText("Disconnect")).toBeNull();
    expect(queryByLabelText("End demo")).toBeNull();
  });

  it("stays quiet while the phone battery is healthy", async () => {
    usePhoneBatteryStore.setState({ levelPercent: 82 });
    const { queryByText, queryByLabelText } = await renderScreen();
    expect(queryByText(KICKER)).toBeNull();
    expect(queryByLabelText(STOP_LOGGING)).toBeNull();
  });

  it("states the consequence when the phone battery is low", async () => {
    usePhoneBatteryStore.setState({ levelPercent: 8 });
    const { getByText } = await renderScreen();
    expect(getByText(KICKER)).toBeTruthy();
    expect(
      getByText(
        "Logging stops below 5 % to protect the recording. The dash keeps running on its own.",
      ),
    ).toBeTruthy();
  });

  it("offers the stop action only while logging is running", async () => {
    usePhoneBatteryStore.setState({ levelPercent: 8 });
    const idle = await renderScreen();
    expect(idle.queryByLabelText(STOP_LOGGING)).toBeNull();
    expect(idle.getByText("OFF")).toBeTruthy();
    await idle.unmount();

    useTrackSessionStore.setState({
      recording: true,
      sessionStartMs: Date.now() - 12 * 60_000,
    });
    const running = await renderScreen();
    expect(running.getByLabelText(STOP_LOGGING)).toBeTruthy();
    expect(running.getByText("ON · 12 min")).toBeTruthy();
  });
});
