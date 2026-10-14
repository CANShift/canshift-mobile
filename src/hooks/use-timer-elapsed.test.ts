import { act, renderHook } from "@testing-library/react-native";
import { useTimerStore } from "../stores/timer.store";
import { useTimerElapsed } from "./use-timer-elapsed";

const initialState = useTimerStore.getState();

const useStoreTimerElapsed = () =>
  useTimerElapsed(useTimerStore((s) => s.status));

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(10_000);
  useTimerStore.setState(initialState, true);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useTimerElapsed", () => {
  it("ticks while the timer runs", async () => {
    const { result } = await renderHook(useStoreTimerElapsed);
    await act(() => {
      useTimerStore.getState().start();
    });
    await act(() => {
      jest.advanceTimersByTime(1_000);
    });
    expect(result.current).toBe(1_000);
  });

  it("freezes on pause and drops to zero on a reset from paused", async () => {
    const { result } = await renderHook(useStoreTimerElapsed);
    await act(() => {
      useTimerStore.getState().start();
    });
    await act(() => {
      jest.advanceTimersByTime(500);
      useTimerStore.getState().pause();
    });
    await act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe(500);
    await act(() => {
      useTimerStore.getState().reset();
    });
    expect(result.current).toBe(0);
  });
});
