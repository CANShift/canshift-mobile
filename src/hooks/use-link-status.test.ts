import { act, renderHook } from "@testing-library/react-native";
import { useSignalsStore } from "../stores/signals.store";
import { useDeviceStore } from "../stores/device.store";
import { LINK_HOLD_MS } from "../lib/link-hold";
import { useLinkStatus, useIsLinkLost } from "./use-link-status";

const signalsInitialState = useSignalsStore.getState();
const deviceInitialState = useDeviceStore.getState();

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(100_000);
  useSignalsStore.setState(signalsInitialState, true);
  useDeviceStore.setState(deviceInitialState, true);
});

afterEach(() => {
  jest.useRealTimers();
});

const dropTheLink = (): void => {
  useSignalsStore.getState().update({ r: 4000, s: 88 });
  useSignalsStore.getState().markStale();
};

describe("useLinkStatus", () => {
  it("reports a live link while frames arrive", async () => {
    useSignalsStore.getState().update({ r: 4000 });
    const { result } = await renderHook(() => useLinkStatus());
    expect(result.current.state).toBe("live");
    expect(result.current.secondsAgo).toBe(0);
  });

  it("waits before the first frame instead of reporting a lost link", async () => {
    const { result } = await renderHook(() => useLinkStatus());
    expect(result.current.state).toBe("waiting");
  });

  it("counts the real seconds since the link dropped", async () => {
    dropTheLink();
    const { result } = await renderHook(() => useLinkStatus());
    await act(() => {
      jest.advanceTimersByTime(8000);
    });
    expect(result.current.state).toBe("lost");
    expect(result.current.secondsAgo).toBe(8);
  });

  it("holds the last values for the whole window", async () => {
    dropTheLink();
    await renderHook(() => useLinkStatus());
    await act(() => {
      jest.advanceTimersByTime(LINK_HOLD_MS - 1000);
    });
    expect(useSignalsStore.getState().values).toEqual({ r: 4000, s: 88 });
  });

  it("clears the held values once the window is over", async () => {
    dropTheLink();
    await renderHook(() => useLinkStatus());
    await act(() => {
      jest.advanceTimersByTime(LINK_HOLD_MS + 1000);
    });
    expect(useSignalsStore.getState().values).toEqual({});
    expect(useSignalsStore.getState().staleSinceMs).toBeGreaterThan(0);
  });

  it("stays live in simulation so the dash never claims a lost link", async () => {
    dropTheLink();
    useDeviceStore.setState({ mode: "sim" });
    const { result } = await renderHook(() => useLinkStatus());
    expect(result.current.state).toBe("live");
  });
});

describe("useIsLinkLost", () => {
  it("is false while frames arrive and true once they stop", async () => {
    useSignalsStore.getState().update({ r: 4000 });
    const live = await renderHook(() => useIsLinkLost());
    expect(live.result.current).toBe(false);

    useSignalsStore.getState().markStale();
    const lost = await renderHook(() => useIsLinkLost());
    expect(lost.result.current).toBe(true);
  });
});
