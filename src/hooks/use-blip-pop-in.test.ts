import { renderHook } from "@testing-library/react-native";
import { AccessibilityInfo, Animated } from "react-native";
import { useBlipPopIn } from "./use-blip-pop-in";

let reduceMotionEnabled: Promise<boolean> = Promise.resolve(false);
const start = jest.fn();
const stop = jest.fn();

beforeEach(() => {
  reduceMotionEnabled = Promise.resolve(false);
  start.mockReset();
  stop.mockReset();
  jest
    .spyOn(Animated, "parallel")
    .mockImplementation(() => ({ start, stop, reset: jest.fn() }));
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockImplementation(() => reduceMotionEnabled);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useBlipPopIn", () => {
  it("pops the blip in with a ripple when it first appears", async () => {
    await renderHook(() => useBlipPopIn());
    expect(start).toHaveBeenCalledTimes(1);
  });

  it("stops the pop-in on unmount", async () => {
    const { unmount } = await renderHook(() => useBlipPopIn());
    await unmount();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("shows the blip at rest when Reduce Motion is on", async () => {
    reduceMotionEnabled = Promise.resolve(true);
    const { result } = await renderHook(() => useBlipPopIn());
    expect(stop).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(result.current.pop)).toBe("1");
    expect(JSON.stringify(result.current.ripple)).toBe("1");
  });
});
