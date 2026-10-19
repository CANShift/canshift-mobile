import { renderHook, act } from "@testing-library/react-native";
import { AccessibilityInfo, Animated } from "react-native";
import { useSonarPulse } from "./use-sonar-pulse";

type FakeLoop = Animated.CompositeAnimation & {
  start: jest.Mock;
  stop: jest.Mock;
};

let loops: FakeLoop[] = [];
let reduceMotionListener: (enabled: boolean) => void = () => undefined;
let reduceMotionEnabled: Promise<boolean> = Promise.resolve(false);

const fakeLoop = (): FakeLoop => {
  const loop = { start: jest.fn(), stop: jest.fn(), reset: jest.fn() };
  loops.push(loop);
  return loop;
};

beforeEach(() => {
  loops = [];
  reduceMotionEnabled = Promise.resolve(false);
  jest.spyOn(Animated, "loop").mockImplementation(fakeLoop);
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockImplementation(() => reduceMotionEnabled);
  jest
    .spyOn(AccessibilityInfo, "addEventListener")
    .mockImplementation((_event, handler) => {
      reduceMotionListener = handler;
      return { remove: jest.fn() };
    });
});

afterEach(() => {
  jest.restoreAllMocks();
});

const renderSonar = (active: boolean) =>
  renderHook(({ on }: { on: boolean }) => useSonarPulse(on), {
    initialProps: { on: active },
  });

describe("useSonarPulse", () => {
  it("runs the pulse and the dot breath while scanning", async () => {
    const { result } = await renderSonar(true);
    expect(result.current.mode).toBe("sweep");
    expect(loops).toHaveLength(2);
    expect(loops.every((loop) => loop.start.mock.calls.length === 1)).toBe(
      true,
    );
  });

  it("stays still when not scanning", async () => {
    const { result } = await renderSonar(false);
    expect(result.current.mode).toBe("idle");
    expect(loops).toHaveLength(0);
  });

  it("stops and resets the loops when scanning ends", async () => {
    const { result, rerender } = await renderSonar(true);
    const resetPulse = jest.spyOn(result.current.pulse, "setValue");
    const resetBreath = jest.spyOn(result.current.breath, "setValue");
    await rerender({ on: false });
    expect(result.current.mode).toBe("idle");
    expect(loops.every((loop) => loop.stop.mock.calls.length === 1)).toBe(true);
    expect(resetPulse).toHaveBeenCalledWith(0);
    expect(resetBreath).toHaveBeenCalledWith(0);
  });

  it("stops the loops on unmount", async () => {
    const { unmount } = await renderSonar(true);
    await unmount();
    expect(loops.every((loop) => loop.stop.mock.calls.length === 1)).toBe(true);
  });

  it("only breathes the dot when Reduce Motion is on", async () => {
    reduceMotionEnabled = Promise.resolve(true);
    const { result } = await renderSonar(true);
    expect(result.current.mode).toBe("calm");
    expect(
      loops.filter((loop) => loop.stop.mock.calls.length === 0),
    ).toHaveLength(1);
  });

  it("falls back to the calm look when Reduce Motion cannot be read", async () => {
    reduceMotionEnabled = Promise.reject(new Error("unavailable"));
    const { result } = await renderSonar(true);
    expect(result.current.mode).toBe("calm");
  });

  it("follows Reduce Motion changes while mounted", async () => {
    const { result } = await renderSonar(true);
    await act(() => {
      reduceMotionListener(true);
    });
    expect(result.current.mode).toBe("calm");
    await act(() => {
      reduceMotionListener(false);
    });
    expect(result.current.mode).toBe("sweep");
  });
});
