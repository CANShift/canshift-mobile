import * as React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { act, fireEvent, render } from "@testing-library/react-native";
import LiveScreen from "./LiveScreen";
import { useDeviceStore } from "../stores/device.store";
import { useReconnectStore } from "../stores/reconnect.store";
import { useSignalsStore } from "../stores/signals.store";
import { useAppSettingsStore } from "../stores/app-settings.store";
import { SIGNAL_STALE_MS } from "../lib/signal-staleness";
import { STRINGS } from "../strings";

const mockReadSettings = jest.fn(() => Promise.resolve({ brightness: 60 }));
const mockPushSettings = jest.fn((_settings: { brightness: number }) =>
  Promise.resolve(),
);

jest.mock("../services/ble.service", () => ({
  readSettings: () => mockReadSettings(),
  pushSettings: (settings: { brightness: number }) =>
    mockPushSettings(settings),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const NOW = 1_000_000;

const renderLive = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <LiveScreen />
    </SafeAreaProvider>,
  );

const initial = {
  device: useDeviceStore.getState(),
  reconnect: useReconnectStore.getState(),
  signals: useSignalsStore.getState(),
};

describe("Live screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
    useDeviceStore.setState(initial.device, true);
    useReconnectStore.setState(initial.reconnect, true);
    useSignalsStore.setState(initial.signals, true);
    useDeviceStore.getState().setDevice("dash-1", "CANShift-4F2A");
    useDeviceStore.getState().setMode("ble");
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("reads each live tile with its label, value and unit", async () => {
    useSignalsStore.getState().update({ op: 3.8, ot: 104 });
    const view = await renderLive();
    expect(view.getByLabelText("Oil pressure, 3.8 bar")).toBeTruthy();
    expect(view.getByLabelText("Oil temp, 104 degrees")).toBeTruthy();
    expect(view.getByLabelText("Fuel pressure, no data")).toBeTruthy();
  });

  it("turns every tile stale with its age once the dash goes quiet", async () => {
    useSignalsStore.getState().update({ ct: 92, r: 3450 });
    jest.setSystemTime(NOW + SIGNAL_STALE_MS + 4_000);
    const view = await renderLive();
    expect(
      view.getByLabelText("Water temp, 92 degrees, 6 seconds ago"),
    ).toBeTruthy();
    expect(view.getAllByText("6 s ago").length).toBe(2);
  });

  it("pauses the footer and stales the tiles while reconnecting", async () => {
    useSignalsStore.getState().update({ ct: 92 });
    useReconnectStore.getState().start("dash-1", 5);
    const view = await renderLive();
    expect(view.getByText(STRINGS.live.footerReconnecting)).toBeTruthy();
    expect(view.queryByLabelText(STRINGS.live.display)).toBeNull();
    expect(
      view.getByLabelText("Water temp, 92 degrees, 0 seconds ago"),
    ).toBeTruthy();
  });

  it("opens the Display sheet with the dash brightness and the keep-awake switch", async () => {
    const view = await renderLive();
    await act(async () => {
      void fireEvent.press(view.getByLabelText(STRINGS.live.display));
      await Promise.resolve();
    });
    expect(mockReadSettings).toHaveBeenCalled();
    expect(view.getByText("60 %")).toBeTruthy();
    await act(() => {
      void fireEvent(
        view.getByLabelText(STRINGS.live.keepScreenOn),
        "valueChange",
        false,
      );
    });
    expect(useAppSettingsStore.getState().keepScreenOn).toBe(false);
  });
});
