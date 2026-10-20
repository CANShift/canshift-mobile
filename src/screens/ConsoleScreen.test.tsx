import * as React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import ConsoleScreen from "./ConsoleScreen";
import { log, useLogStore } from "../stores/log.store";
import { useDeviceStore } from "../stores/device.store";
import { STRINGS } from "../strings";
import { useCanMonitorStore } from "../stores/can-monitor.store";
import { stopSimCan } from "../services/sim-can.service";
import { sortedCanRows } from "../lib/can-monitor-model";
import { DASH_FILTER_DEBOUNCE_MS } from "../hooks/use-can-dash-filter";

const mockSendCmd = jest.fn((_cmd: string) => Promise.resolve());
const mockStartCanMonitor = jest.fn(() => true);
const mockStopCanMonitor = jest.fn();
const mockSetCanMonitorFilter = jest.fn((_filters: unknown) =>
  Promise.resolve(),
);

jest.mock("../services/ble.service", () => ({
  sendCmd: (cmd: string) => mockSendCmd(cmd),
  startCanMonitor: () => mockStartCanMonitor(),
  stopCanMonitor: () => {
    mockStopCanMonitor();
  },
  setCanMonitorFilter: (filters: unknown) => mockSetCanMonitorFilter(filters),
}));

const renderConsole = () => render(<ConsoleScreen onBack={jest.fn()} />);

type View = Awaited<ReturnType<typeof renderConsole>>;

const press = async (view: View, label: string) => {
  await act(() => {
    void fireEvent.press(view.getByLabelText(label));
  });
};

const initialDevice = useDeviceStore.getState();

describe("Console", () => {
  beforeEach(() => {
    useLogStore.getState().clear();
    useDeviceStore.setState(initialDevice, true);
    mockSendCmd.mockClear();
    mockStartCanMonitor.mockClear();
    mockStopCanMonitor.mockClear();
    mockSetCanMonitorFilter.mockClear();
    useCanMonitorStore.getState().reset();
  });

  it("filters the log by level", async () => {
    log("info", "link up");
    log("error", "write failed");
    const view = await renderConsole();
    expect(view.getByText("link up")).toBeTruthy();
    await press(view, STRINGS.console.filterErrors);
    expect(view.queryByText("link up")).toBeNull();
    expect(view.getByText("write failed")).toBeTruthy();
  });

  it("filters the log by text", async () => {
    log("info", "link up");
    log("warn", "slow frame");
    const view = await renderConsole();
    await act(() => {
      void fireEvent.changeText(
        view.getByLabelText(STRINGS.console.filter),
        "slow",
      );
    });
    expect(view.queryByText("link up")).toBeNull();
    expect(view.getByText("slow frame")).toBeTruthy();
  });

  it("sends a command and keeps it in the history", async () => {
    useDeviceStore.setState({ mode: "ble", connectionState: "connected" });
    const view = await renderConsole();
    await press(view, STRINGS.console.send);
    expect(view.getByText(STRINGS.console.sendHint)).toBeTruthy();
    await act(() => {
      void fireEvent.changeText(
        view.getByLabelText(STRINGS.console.command),
        "reset_odo",
      );
    });
    const sendButtons = view.getAllByLabelText(STRINGS.console.send);
    const sendButton = sendButtons[sendButtons.length - 1];
    if (sendButton === undefined) throw new Error("no send button");
    await act(async () => {
      void fireEvent.press(sendButton);
      await Promise.resolve();
    });
    expect(mockSendCmd).toHaveBeenCalledWith("reset_odo");
    expect(view.getByText("> reset_odo")).toBeTruthy();
  });

  it("explains that send needs a Bluetooth dash", async () => {
    const view = await renderConsole();
    await press(view, STRINGS.console.send);
    expect(view.getByText(STRINGS.console.sendUnavailable)).toBeTruthy();
  });

  it("asks for a dash on the CAN tab while nothing is linked", async () => {
    const view = await renderConsole();
    await press(view, STRINGS.console.can);
    expect(view.getByText(STRINGS.console.canOffTitle)).toBeTruthy();
    expect(mockStartCanMonitor).not.toHaveBeenCalled();
  });

  it("subscribes to the dash's CAN monitor only while the tab is open", async () => {
    useDeviceStore.setState({ mode: "ble", connectionState: "connected" });
    const view = await renderConsole();
    expect(mockStartCanMonitor).not.toHaveBeenCalled();
    await press(view, STRINGS.console.can);
    expect(mockStartCanMonitor).toHaveBeenCalledTimes(1);
    await press(view, STRINGS.console.log);
    expect(mockStopCanMonitor).toHaveBeenCalledTimes(1);
  });
});

describe("Console CAN tab on a Bluetooth dash", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useDeviceStore.setState(
      { ...initialDevice, mode: "ble", connectionState: "connected" },
      true,
    );
    useCanMonitorStore.getState().reset();
    mockSetCanMonitorFilter.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const typeFilter = async (view: View, text: string) => {
    await act(() => {
      void fireEvent.changeText(
        view.getByLabelText(STRINGS.console.canFilter),
        text,
      );
    });
    await act(() => {
      jest.advanceTimersByTime(DASH_FILTER_DEBOUNCE_MS);
    });
  };

  it("filters on the dash once the field holds a complete id", async () => {
    const view = await renderConsole();
    await press(view, STRINGS.console.can);
    await typeFilter(view, "3E");
    expect(mockSetCanMonitorFilter).not.toHaveBeenCalled();
    await typeFilter(view, "3E0");
    expect(mockSetCanMonitorFilter).toHaveBeenLastCalledWith([
      { id: 0x3e0, extended: false, mask: 0x7ff },
    ]);
    await typeFilter(view, "3E");
    expect(mockSetCanMonitorFilter).toHaveBeenLastCalledWith([]);
    expect(mockSetCanMonitorFilter).toHaveBeenCalledTimes(2);
  });

  it("says so when the dash refuses the filter", async () => {
    mockSetCanMonitorFilter.mockRejectedValueOnce(new Error("write failed"));
    const view = await renderConsole();
    await press(view, STRINGS.console.can);
    useCanMonitorStore.getState().ingest({
      deviceMs: 100,
      overflow: false,
      filtered: false,
      entries: [{ id: 0x3e0, extended: false, data: [1], count: 1, ageMs: 0 }],
    });
    await typeFilter(view, "3E0");
    expect(view.getByText(STRINGS.console.canDashFilterFailed)).toBeTruthy();
  });
});

describe("Console CAN tab in demo mode", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useDeviceStore.setState({ ...initialDevice, mode: "sim" }, true);
    useCanMonitorStore.getState().reset();
  });

  afterEach(() => {
    stopSimCan();
    jest.useRealTimers();
  });

  const tick = async (ms: number) => {
    await act(() => {
      jest.advanceTimersByTime(ms);
    });
  };

  it("lists the simulated ids and filters them live", async () => {
    const view = await renderConsole();
    await press(view, STRINGS.console.can);
    await tick(1000);
    expect(view.getByText("360")).toBeTruthy();
    expect(view.getByText("3E0")).toBeTruthy();
    await act(() => {
      void fireEvent.changeText(
        view.getByLabelText(STRINGS.console.canFilter),
        "3e",
      );
    });
    expect(view.queryByText("360")).toBeNull();
    expect(view.getByText("3E0")).toBeTruthy();
  });

  it("freezes the table on pause while frames keep arriving", async () => {
    const view = await renderConsole();
    await press(view, STRINGS.console.can);
    await tick(100);
    expect(view.queryByText("3E0")).toBeNull();
    await press(view, STRINGS.console.pause);
    await tick(1000);
    expect(sortedCanRows(useCanMonitorStore.getState().snapshot)).toHaveLength(
      9,
    );
    expect(view.queryByText("3E0")).toBeNull();
    await press(view, STRINGS.console.resume);
    expect(view.getByText("3E0")).toBeTruthy();
  });
});
