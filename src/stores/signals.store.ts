import { create } from "zustand";
import type { SignalKey } from "../constants/ble";
import { pushSample, type SignalValues } from "./telemetry.store";

export type TelemetryPayload = Partial<Record<SignalKey, number>>;

interface SignalsState {
  values: TelemetryPayload;
  lastUpdateMs: number;
  isLive: boolean;
  staleSinceMs: number;

  update: (payload: TelemetryPayload) => void;
  markStale: () => void;
  clearHeld: () => void;
}

export const useSignalsStore = create<SignalsState>()((set) => ({
  values: {},
  lastUpdateMs: 0,
  isLive: false,
  staleSinceMs: 0,

  update: (payload) => {
    const defined: SignalValues = {};
    for (const [k, v] of Object.entries(payload)) {
      if (typeof v === "number") defined[k as SignalKey] = v;
    }
    pushSample(defined);
    set((s) => ({
      values: { ...s.values, ...payload },
      lastUpdateMs: Date.now(),
      isLive: true,
      staleSinceMs: 0,
    }));
  },

  markStale: () => {
    set((s) => ({
      isLive: false,
      staleSinceMs: s.staleSinceMs > 0 ? s.staleSinceMs : Date.now(),
    }));
  },

  clearHeld: () => {
    set({ values: {} });
  },
}));

export const useSignalValue = (key: SignalKey): number | undefined => {
  return useSignalsStore((s) => s.values[key]);
};

export const useSignalsIsLive = (): boolean => {
  return useSignalsStore((s) => s.isLive);
};
