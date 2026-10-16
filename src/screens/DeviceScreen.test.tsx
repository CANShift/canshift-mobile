import * as React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DeviceScreen from "./DeviceScreen";
import { useDeviceStore } from "../stores/device.store";
import { useTrackSessionStore } from "../stores/track-session.store";
import { STRINGS } from "../strings";

const mockDisconnect = jest.fn(() => Promise.resolve());
const mockSimStop = jest.fn();
const mockReset = jest.fn();
const mockStartTrack = jest.fn(() => Promise.resolve());
const mockStopTrack = jest.fn(() => Promise.resolve());

jest.mock("../services/ble.service", () => ({
  disconnect: () => mockDisconnect(),
  tryReconnectLastDevice: () => Promise.resolve(false),
  cancelReconnect: jest.fn(),
}));
jest.mock("../services/sim.service", () => ({
  stop: () => {
    mockSimStop();
  },
}));
jest.mock("../navigation/navigation-ref", () => ({
  resetToScan: () => {
    mockReset();
  },
}));
jest.mock("../lib/track-mode-actions", () => ({
  startTrackMode: () => mockStartTrack(),
  stopTrackMode: () => mockStopTrack(),
}));
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const onOpenConsole = jest.fn();

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <DeviceScreen onOpenConsole={onOpenConsole} />
    </SafeAreaProvider>,
  );

type View = Awaited<ReturnType<typeof renderScreen>>;

const press = async (view: View, label: string) => {
  await act(() => {
    void fireEvent.press(view.getByLabelText(label));
  });
};

const pressLast = async (view: View, label: string) => {
  const matches = view.getAllByLabelText(label);
  const last = matches[matches.length - 1];
  if (last === undefined) throw new Error(`no ${label}`);
  await act(() => {
    void fireEvent.press(last);
  });
};

const initialDevice = useDeviceStore.getState();

describe("DeviceScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDeviceStore.setState(initialDevice, true);
    useTrackSessionStore.setState({ recording: false, sessionStartMs: 0 });
    useDeviceStore.getState().setDevice("AA:BB", "CANShift-4F2A");
    useDeviceStore.getState().setMode("ble");
    useDeviceStore.getState().setFirmwareStatus("0.20.2", true);
  });

  it("lists the dash and app facts", async () => {
    const view = await renderScreen();
    expect(
      view.getByText(STRINGS.device.viaBluetooth("CANShift-4F2A")),
    ).toBeTruthy();
    expect(view.getByText("v0.20.2")).toBeTruthy();
    expect(view.getByText(STRINGS.device.configVersion)).toBeTruthy();
    expect(view.getByText(STRINGS.device.dashBattery)).toBeTruthy();
  });

  it("asks before disconnecting, then goes back to Scan", async () => {
    const view = await renderScreen();
    await press(view, STRINGS.device.disconnect);
    expect(view.getByText(STRINGS.device.disconnectTitle)).toBeTruthy();
    await pressLast(view, STRINGS.device.disconnect);
    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
  });

  it("shows the demo card with End demo in a simulated session", async () => {
    useDeviceStore.getState().setMode("sim");
    const view = await renderScreen();
    expect(view.getByText(STRINGS.device.demoBody)).toBeTruthy();
    await press(view, STRINGS.device.endDemo);
    await pressLast(view, STRINGS.device.endDemo);
    expect(mockSimStop).toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
  });

  it("starts and stops logging from its card", async () => {
    const idle = await renderScreen();
    await press(idle, STRINGS.device.startLogging);
    expect(mockStartTrack).toHaveBeenCalled();
    await idle.unmount();
    useTrackSessionStore.setState({
      recording: true,
      sessionStartMs: Date.now() - 252_000,
    });
    const running = await renderScreen();
    expect(running.getByText("04:12")).toBeTruthy();
    await press(running, STRINGS.device.stopLogging);
    expect(mockStopTrack).toHaveBeenCalled();
  });

  it("opens the console", async () => {
    const view = await renderScreen();
    await press(view, STRINGS.device.console);
    expect(onOpenConsole).toHaveBeenCalled();
  });
});
