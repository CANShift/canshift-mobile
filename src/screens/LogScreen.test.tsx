import * as React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LogScreen from "./LogScreen";
import { useDeviceStore } from "../stores/device.store";

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <LogScreen onBack={jest.fn()} />
    </SafeAreaProvider>,
  );

beforeEach(() => {
  useDeviceStore.setState({ mode: "idle", connectionState: "idle" });
});

describe("LogScreen — empty CAN console", () => {
  it("states over three lines why the app holds no frames", async () => {
    const { getByText } = await renderScreen();
    expect(
      getByText("NO FRAMES YET.\nTHE DASH SENDS TELEMETRY,\nNOT THE RAW BUS."),
    ).toBeTruthy();
  });

  it("states the link the app actually has at the bottom", async () => {
    useDeviceStore.setState({ mode: "ble", connectionState: "connected" });
    const { getByText } = await renderScreen();
    expect(getByText("Link: connected")).toBeTruthy();
  });

  it("keeps the three tabs reachable while the console is empty", async () => {
    const { getByRole, getByLabelText } = await renderScreen();
    expect(getByRole("tab", { name: "CAN", selected: true })).toBeTruthy();
    await fireEvent.press(getByLabelText("Send"));
    expect(getByRole("tab", { name: "Send", selected: true })).toBeTruthy();
  });

  it("sends the reader to the log, the one stream the app does receive", async () => {
    const { getByLabelText, getByRole } = await renderScreen();
    await fireEvent.press(getByLabelText("OPEN THE LOG"));
    expect(getByRole("tab", { name: "Log", selected: true })).toBeTruthy();
  });
});
