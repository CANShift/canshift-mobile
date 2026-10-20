import { startSimCan, stopSimCan } from "./sim-can.service";
import { useCanMonitorStore } from "../stores/can-monitor.store";
import { busRateHz, sortedCanRows } from "../lib/can-monitor-model";

const SECONDS = 3;

describe("sim CAN source", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useCanMonitorStore.getState().reset();
  });

  afterEach(() => {
    stopSimCan();
    jest.useRealTimers();
  });

  it("feeds the CAN monitor store at a believable bus rate", () => {
    startSimCan();
    jest.advanceTimersByTime(SECONDS * 1000);
    const { snapshot, feed } = useCanMonitorStore.getState();
    const rows = sortedCanRows(snapshot);
    expect(feed).toBe("listening");
    expect(rows).toHaveLength(9);
    expect(busRateHz(rows)).toBeCloseTo(205, -1);
  });

  it("runs one interval and stops it", () => {
    startSimCan();
    startSimCan();
    expect(jest.getTimerCount()).toBe(1);
    stopSimCan();
    expect(jest.getTimerCount()).toBe(0);
  });
});
