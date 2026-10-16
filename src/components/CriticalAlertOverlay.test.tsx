import * as React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { sensorDefaultDangerBand } from "@canshift/core";
import { CriticalAlertOverlay } from "./CriticalAlertOverlay";
import { useSignalsStore } from "../stores/signals.store";
import { useDeviceStore } from "../stores/device.store";
import { useCriticalAlertStore } from "../stores/critical-alert.store";
import { ALERT_ACK_CMD } from "../services/critical-alert-control";

const mockSendCmd = jest.fn(
  (_cmd: string, _payload?: Record<string, unknown>) => Promise.resolve(),
);

jest.mock("../services/ble.service", () => ({
  sendCmd: (cmd: string, payload?: Record<string, unknown>) =>
    mockSendCmd(cmd, payload),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const OP_LIMIT = sensorDefaultDangerBand("oil_press").below ?? 0;
const OP_TRIP = OP_LIMIT - 0.5;
const OP_SAFE = OP_LIMIT + 1;
const CT_TRIP = (sensorDefaultDangerBand("coolant_temp").above ?? 0) + 5;

const initialSignals = useSignalsStore.getState();
const initialDevice = useDeviceStore.getState();
const initialAlert = useCriticalAlertStore.getState();

const renderOverlay = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <CriticalAlertOverlay />
    </SafeAreaProvider>,
  );

const raiseFromDash = (): void => {
  useSignalsStore.getState().update({ op: OP_TRIP, r: 5200, ot: 128 });
};

type Rendered = Awaited<ReturnType<typeof renderOverlay>>;

const press = async (view: Rendered, label: string) => {
  await act(() => {
    void fireEvent.press(view.getByLabelText(label));
    return Promise.resolve();
  });
};

const FIXED_NOW = 1_000_000;

describe("CriticalAlertOverlay", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
    jest.clearAllMocks();
    useSignalsStore.setState(initialSignals, true);
    useDeviceStore.setState(initialDevice, true);
    useCriticalAlertStore.setState(initialAlert, true);
    useDeviceStore.setState({ connectionState: "connected", mode: "ble" });
  });

  it("stays out of the way until the dash raises an alert", async () => {
    const { queryByText } = await renderOverlay();
    expect(queryByText("OIL PRESSURE")).toBeNull();
  });

  it("stays out of the way when the dash stream is not live", async () => {
    useSignalsStore.setState({ values: { op: OP_TRIP }, isLive: false });
    const { queryByText } = await renderOverlay();
    expect(queryByText("OIL PRESSURE")).toBeNull();
  });

  it("ignores a frozen value the dash stopped sending", async () => {
    useSignalsStore.setState({
      values: { op: OP_TRIP, r: 5200 },
      lastAt: { op: Date.now() - 5_000, r: Date.now() },
      isLive: true,
    });
    const { queryByText } = await renderOverlay();
    expect(queryByText("OIL PRESSURE")).toBeNull();
  });

  it("mirrors the dash takeover with its context table", async () => {
    raiseFromDash();
    const { getByText } = await renderOverlay();
    expect(getByText("OIL PRESSURE")).toBeTruthy();
    expect(getByText(`MIN ${OP_LIMIT.toFixed(1)} bar`)).toBeTruthy();
    expect(getByText("RPM")).toBeTruthy();
    expect(getByText("5200")).toBeTruthy();
    expect(getByText("OIL TEMP")).toBeTruthy();
    expect(getByText("128 °C")).toBeTruthy();
    expect(getByText("SINCE")).toBeTruthy();
    expect(getByText("STOP THE ENGINE")).toBeTruthy();
    expect(getByText("ACKNOWLEDGE")).toBeTruthy();
    expect(getByText("MUTE FOR THIS SESSION")).toBeTruthy();
  });

  it("sends the acknowledgement to the dash and drops the takeover", async () => {
    raiseFromDash();
    const view = await renderOverlay();
    await press(view, "Acknowledge");
    expect(mockSendCmd).toHaveBeenCalledWith(ALERT_ACK_CMD, { signal: "op" });
    expect(view.queryByText("OIL PRESSURE")).toBeNull();
  });

  it("still raises coolant after oil pressure was acknowledged", async () => {
    raiseFromDash();
    const view = await renderOverlay();
    await press(view, "Acknowledge");
    await act(() => {
      useSignalsStore.getState().update({ op: OP_TRIP, ct: CT_TRIP });
      return Promise.resolve();
    });
    expect(view.getByText("COOLANT")).toBeTruthy();
    expect(view.queryByText("OIL PRESSURE")).toBeNull();
  });

  it("raises oil pressure again after it recovers and re-trips", async () => {
    raiseFromDash();
    const view = await renderOverlay();
    await press(view, "Acknowledge");
    await act(() => {
      useSignalsStore.getState().update({ op: OP_SAFE });
      return Promise.resolve();
    });
    await act(() => {
      useSignalsStore.getState().update({ op: OP_TRIP });
      return Promise.resolve();
    });
    expect(view.getByText("OIL PRESSURE")).toBeTruthy();
  });

  it("keeps a muted signal quiet for the rest of the session", async () => {
    raiseFromDash();
    const view = await renderOverlay();
    await press(view, "Mute for this session");
    expect(mockSendCmd).not.toHaveBeenCalled();
    raiseFromDash();
    expect(view.queryByText("OIL PRESSURE")).toBeNull();
    expect(useCriticalAlertStore.getState().mutedKeys).toEqual(["op"]);
  });
});
