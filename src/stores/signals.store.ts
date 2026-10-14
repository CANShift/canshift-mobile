import { create } from "zustand";
import type { SignalKey } from "../constants/ble";
import { pushSample, type SignalValues } from "./telemetry.store";

export type TelemetryPayload = Partial<Record<SignalKey, number>>;

export const DISPLAY_FLUSH_MS = 33;

interface SignalsState {
  values: TelemetryPayload;
  lastUpdateMs: number;
  isLive: boolean;
  staleSinceMs: number;

  ingest: (payload: TelemetryPayload) => void;
  update: (payload: TelemetryPayload) => void;
  markStale: () => void;
  clearHeld: () => void;
}

let pendingPayload: TelemetryPayload | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const dropPendingFlush = (): void => {
  if (flushTimer !== null) clearTimeout(flushTimer);
  flushTimer = null;
  pendingPayload = null;
};

const definedValues = (payload: TelemetryPayload): SignalValues => {
  const defined: SignalValues = {};
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === "number") defined[k as SignalKey] = v;
  }
  return defined;
};

export const useSignalsStore = create<SignalsState>()((set, get) => ({
  values: {},
  lastUpdateMs: 0,
  isLive: false,
  staleSinceMs: 0,

  ingest: (payload) => {
    pushSample(definedValues(payload));
    pendingPayload = { ...pendingPayload, ...payload };
    if (flushTimer !== null) return;
    flushTimer = setTimeout(() => {
      const flushed = pendingPayload ?? {};
      flushTimer = null;
      pendingPayload = null;
      get().update(flushed);
    }, DISPLAY_FLUSH_MS);
  },

  update: (payload) => {
    set((s) => ({
      values: { ...s.values, ...payload },
      lastUpdateMs: Date.now(),
      isLive: true,
      staleSinceMs: 0,
    }));
  },

  markStale: () => {
    dropPendingFlush();
    set((s) => ({
      isLive: false,
      staleSinceMs: s.staleSinceMs > 0 ? s.staleSinceMs : Date.now(),
    }));
  },

  clearHeld: () => {
    dropPendingFlush();
    set({ values: {} });
  },
}));

export const useSignalValue = (key: SignalKey): number | undefined => {
  return useSignalsStore((s) => s.values[key]);
};

export const useSignalsIsLive = (): boolean => {
  return useSignalsStore((s) => s.isLive);
};
