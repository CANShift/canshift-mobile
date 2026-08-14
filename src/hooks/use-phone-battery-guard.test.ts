import { act, renderHook, waitFor } from "@testing-library/react-native";
import {
  usePhoneBatteryGuard,
  type PhoneBatteryGuardDeps,
  type PhoneBatteryToastParams,
} from "./use-phone-battery-guard";
import { usePhoneBatteryStore } from "../stores/phone-battery.store";
import type { PhoneBatteryWatcher } from "../services/phone-battery";

jest.mock("expo-battery", () => ({
  getBatteryLevelAsync: jest.fn(),
  addBatteryLevelListener: jest.fn(),
}));

interface Harness {
  watcher: PhoneBatteryWatcher;
  emit: (fraction: number) => void;
}

const createWatcher = (initialFraction: number): Harness => {
  let listener: ((fraction: number) => void) | null = null;
  return {
    watcher: {
      read: () => Promise.resolve(initialFraction),
      subscribe: (onLevel) => {
        listener = onLevel;
        return () => {
          listener = null;
        };
      },
    },
    emit: (fraction) => {
      listener?.(fraction);
    },
  };
};

const mountGuard = async (deps: PhoneBatteryGuardDeps) => {
  const rendered = await renderHook(() => {
    usePhoneBatteryGuard(deps);
  });
  return rendered;
};

describe("usePhoneBatteryGuard", () => {
  beforeEach(() => {
    usePhoneBatteryStore.setState({ levelPercent: null });
  });

  it("publishes the level as a percentage", async () => {
    const { watcher } = createWatcher(0.08);
    await mountGuard({
      watcher,
      isLogging: () => false,
      stopLogging: () => Promise.resolve(),
      showToast: jest.fn(),
    });
    await waitFor(() => {
      expect(usePhoneBatteryStore.getState().levelPercent).toBe(8);
    });
  });

  it("stops logging below the 5 % cut-off", async () => {
    const { watcher } = createWatcher(0.04);
    const stopLogging = jest.fn(() => Promise.resolve());
    const showToast = jest.fn((_params: PhoneBatteryToastParams) => undefined);
    await mountGuard({
      watcher,
      isLogging: () => true,
      stopLogging,
      showToast,
    });
    await waitFor(() => {
      expect(stopLogging).toHaveBeenCalledTimes(1);
    });
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "info", text1: "Logging stopped" }),
    );
  });

  it("keeps logging at exactly 5 %", async () => {
    const { watcher } = createWatcher(0.05);
    const stopLogging = jest.fn(() => Promise.resolve());
    await mountGuard({
      watcher,
      isLogging: () => true,
      stopLogging,
      showToast: jest.fn(),
    });
    await waitFor(() => {
      expect(usePhoneBatteryStore.getState().levelPercent).toBe(5);
    });
    expect(stopLogging).not.toHaveBeenCalled();
  });

  it("does not stop anything when nothing is being logged", async () => {
    const { watcher } = createWatcher(0.01);
    const stopLogging = jest.fn(() => Promise.resolve());
    await mountGuard({
      watcher,
      isLogging: () => false,
      stopLogging,
      showToast: jest.fn(),
    });
    await waitFor(() => {
      expect(usePhoneBatteryStore.getState().levelPercent).toBe(1);
    });
    expect(stopLogging).not.toHaveBeenCalled();
  });

  it("cuts logging off when the level drops mid-session", async () => {
    const { watcher, emit } = createWatcher(0.3);
    const stopLogging = jest.fn(() => Promise.resolve());
    await mountGuard({
      watcher,
      isLogging: () => true,
      stopLogging,
      showToast: jest.fn(),
    });
    await waitFor(() => {
      expect(usePhoneBatteryStore.getState().levelPercent).toBe(30);
    });
    await act(async () => {
      emit(0.02);
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(stopLogging).toHaveBeenCalledTimes(1);
    });
  });

  it("surfaces a failure to stop logging", async () => {
    const { watcher } = createWatcher(0.02);
    const showToast = jest.fn((_params: PhoneBatteryToastParams) => undefined);
    await mountGuard({
      watcher,
      isLogging: () => true,
      stopLogging: () => Promise.reject(new Error("gps busy")),
      showToast,
    });
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Could not stop logging",
        }),
      );
    });
  });
});
