import * as React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { act, fireEvent, render } from "@testing-library/react-native";
import LiveScreen from "./LiveScreen";
import { PAGES_STRINGS } from "../pages-strings";
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

const onOpenPages = jest.fn();

const renderLive = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <LiveScreen onOpenPages={onOpenPages} />
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
    expect(view.getAllByLabelText("Oil pressure, 3.8 bar")[0]).toBeTruthy();
    expect(view.getAllByLabelText("Oil temp, 104 degrees")[0]).toBeTruthy();
    expect(view.getAllByLabelText("Fuel pressure, no data")[0]).toBeTruthy();
  });

  it("turns every tile stale with its age once the dash goes quiet", async () => {
    useSignalsStore.getState().update({ ct: 92, r: 3450 });
    jest.setSystemTime(NOW + SIGNAL_STALE_MS + 4_000);
    const view = await renderLive();
    expect(
      view.getAllByLabelText("Water temp, 92 degrees, 6 seconds ago")[0],
    ).toBeTruthy();
    expect(view.queryByText("0 s ago")).toBeNull();
  });

  it("pauses the footer and stales the tiles while reconnecting", async () => {
    useSignalsStore.getState().update({ ct: 92 });
    useReconnectStore.getState().start("dash-1", 5);
    const view = await renderLive();
    expect(view.getByText(STRINGS.live.footerReconnecting)).toBeTruthy();
    expect(view.queryByLabelText(STRINGS.live.display)).toBeNull();
    expect(
      view.getAllByLabelText("Water temp, 92 degrees, 0 seconds ago")[0],
    ).toBeTruthy();
  });

  it("keeps the dash pages and switches page from its chip", async () => {
    useSignalsStore.getState().update({ g: 3, tps: 40 });
    const view = await renderLive();
    expect(view.getAllByLabelText("Gear, 3")[0]).toBeTruthy();
    await act(() => {
      void fireEvent.press(view.getByRole("tab", { name: "Tuning" }));
    });
    expect(
      view.getByRole("tab", { name: "Tuning" }).props.accessibilityState,
    ).toMatchObject({ selected: true });
    expect(view.getAllByLabelText("Throttle, 40 percent")[0]).toBeTruthy();
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

  it("opens the dash pages from the footer", async () => {
    const view = await renderLive();
    await act(() => {
      void fireEvent.press(view.getByLabelText(PAGES_STRINGS.open));
    });
    expect(onOpenPages).toHaveBeenCalled();
  });
});
