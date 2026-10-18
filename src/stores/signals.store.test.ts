import { clearBuffer, getRange, getWriteIndex } from "./telemetry.store";
import {
  DISPLAY_FLUSH_MS,
  useSignalsStore,
  type TelemetryPayload,
} from "./signals.store";

const initialState = useSignalsStore.getState();

describe("useSignalsStore", () => {
  beforeEach(() => {
    useSignalsStore.setState(initialState, true);
    useSignalsStore.getState().clearHeld();
    clearBuffer();
  });

  it("exposes a clean initial state", () => {
    const state = useSignalsStore.getState();
    expect(state.values).toEqual({});
    expect(state.lastUpdateMs).toBe(0);
    expect(state.isLive).toBe(false);
  });

  it("update() stores the payload, marks live, and stamps lastUpdateMs", () => {
    const before = Date.now();
    useSignalsStore.getState().update({ r: 1500, tps: 10 });
    const state = useSignalsStore.getState();
    expect(state.values).toEqual({ r: 1500, tps: 10 });
    expect(state.isLive).toBe(true);
    expect(state.lastUpdateMs).toBeGreaterThanOrEqual(before);
  });

  it("ingest() forwards the sample to the telemetry ring buffer immediately", () => {
    useSignalsStore.getState().ingest({ r: 2000, tps: 20 });
    const buffer = getRange(0, getWriteIndex());
    expect(buffer).toHaveLength(1);
    expect(buffer[0]?.v).toEqual({ r: 2000, tps: 20 });
  });

  it("update() stamps each signal it carries", () => {
    useSignalsStore.getState().update({ r: 1500, op: 3.8 });
    const state = useSignalsStore.getState();
    expect(state.lastAt.r).toBe(state.lastUpdateMs);
    expect(state.lastAt.op).toBe(state.lastUpdateMs);
    expect(state.lastAt.ct).toBeUndefined();
  });

  it("ingest() drops a frame with no valid signal so it never counts as live", () => {
    jest.useFakeTimers();
    useSignalsStore.getState().ingest({});
    jest.advanceTimersByTime(DISPLAY_FLUSH_MS);
    jest.useRealTimers();
    expect(useSignalsStore.getState().isLive).toBe(false);
    expect(getWriteIndex()).toBe(0);
  });

  it("ingest() clears the held values when a frame carries no valid signal", () => {
    useSignalsStore.getState().update({ r: 1500, ot: 95 });
    useSignalsStore.getState().ingest({});
    const state = useSignalsStore.getState();
    expect(state.values).toEqual({});
    expect(state.lastAt).toEqual({});
  });

  it("update() handles an empty payload without throwing", () => {
    useSignalsStore.getState().update({});
    const state = useSignalsStore.getState();
    expect(state.values).toEqual({});
    expect(state.isLive).toBe(true);
  });

  it("markStale() flips isLive off without clearing the cached values", () => {
    useSignalsStore.getState().update({ r: 1500 });
    useSignalsStore.getState().markStale();
    const state = useSignalsStore.getState();
    expect(state.isLive).toBe(false);
    expect(state.values).toEqual({ r: 1500 });
  });

  it("markStale() stamps the drop once and keeps the first stamp", () => {
    useSignalsStore.getState().update({ r: 1500 });
    useSignalsStore.getState().markStale();
    const first = useSignalsStore.getState().staleSinceMs;
    expect(first).toBeGreaterThan(0);
    useSignalsStore.getState().markStale();
    expect(useSignalsStore.getState().staleSinceMs).toBe(first);
  });

  it("update() clears the drop stamp when frames come back", () => {
    useSignalsStore.getState().markStale();
    useSignalsStore.getState().update({ r: 1500 });
    expect(useSignalsStore.getState().staleSinceMs).toBe(0);
  });

  it("clearHeld() drops the held values without clearing the drop stamp", () => {
    useSignalsStore.getState().update({ r: 1500 });
    useSignalsStore.getState().markStale();
    useSignalsStore.getState().clearHeld();
    const state = useSignalsStore.getState();
    expect(state.values).toEqual({});
    expect(state.staleSinceMs).toBeGreaterThan(0);
  });

  it("update() replaces the held values with the frame, so a signal it omits is gone", () => {
    useSignalsStore.getState().update({ r: 1500, tps: 10 });
    useSignalsStore.getState().update({ r: 2000 });
    const state = useSignalsStore.getState();
    expect(state.values).toEqual({ r: 2000 });
    expect(state.lastAt.tps).toBeUndefined();
  });

  it("update() lets a fresh value overwrite the previous reading for the same key", () => {
    useSignalsStore.getState().update({ r: 1500 });
    useSignalsStore.getState().update({ r: 2200 });
    expect(useSignalsStore.getState().values).toEqual({ r: 2200 });
  });

  it("ingest() strips undefined entries before pushing to the ring buffer", () => {
    useSignalsStore.getState().ingest({
      r: 2000,
      tps: undefined,
      ect: 90,
    } as unknown as TelemetryPayload);
    const buffer = getRange(0, getWriteIndex());
    expect(buffer).toHaveLength(1);
    expect(buffer[0]?.v).toEqual({ r: 2000, ect: 90 });
  });

  describe("ingest() coalescing", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("holds the display values until the flush window closes", () => {
      useSignalsStore.getState().ingest({ r: 1500 });
      expect(useSignalsStore.getState().values).toEqual({});
      jest.advanceTimersByTime(DISPLAY_FLUSH_MS);
      expect(useSignalsStore.getState().values).toEqual({ r: 1500 });
      expect(useSignalsStore.getState().isLive).toBe(true);
    });

    it("keeps only the latest frame of a burst, in one store write", () => {
      const listener = jest.fn();
      const unsubscribe = useSignalsStore.subscribe(listener);
      useSignalsStore.getState().ingest({ r: 1500, tps: 10 });
      useSignalsStore.getState().ingest({ r: 1600 });
      useSignalsStore.getState().ingest({ r: 1700, s: 40 });
      jest.advanceTimersByTime(DISPLAY_FLUSH_MS);
      unsubscribe();
      expect(listener).toHaveBeenCalledTimes(1);
      expect(useSignalsStore.getState().values).toEqual({ r: 1700, s: 40 });
      expect(getWriteIndex()).toBe(3);
    });

    it("drops a pending flush when the link goes stale", () => {
      useSignalsStore.getState().ingest({ r: 1500 });
      useSignalsStore.getState().markStale();
      jest.advanceTimersByTime(DISPLAY_FLUSH_MS);
      expect(useSignalsStore.getState().isLive).toBe(false);
      expect(useSignalsStore.getState().values).toEqual({});
    });

    it("lets a frame with no valid signal override a pending one", () => {
      useSignalsStore.getState().ingest({ r: 1500 });
      useSignalsStore.getState().ingest({});
      jest.advanceTimersByTime(DISPLAY_FLUSH_MS);
      expect(useSignalsStore.getState().values).toEqual({});
      expect(useSignalsStore.getState().isLive).toBe(false);
    });

    it("drops a pending flush when the held values are cleared", () => {
      useSignalsStore.getState().update({ r: 1500 });
      useSignalsStore.getState().ingest({ r: 2000 });
      useSignalsStore.getState().clearHeld();
      jest.advanceTimersByTime(DISPLAY_FLUSH_MS);
      expect(useSignalsStore.getState().values).toEqual({});
    });
  });
});
