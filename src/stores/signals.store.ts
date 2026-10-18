import { create, type StoreApi } from "zustand";
import type { SignalKey } from "../constants/ble";
import { pushSample, type SignalValues } from "./telemetry.store";

export type TelemetryPayload = Partial<Record<SignalKey, number>>;

export type SignalStamps = Partial<Record<SignalKey, number>>;

export const DISPLAY_FLUSH_MS = 33;

interface SignalsState {
  values: TelemetryPayload;
  lastAt: SignalStamps;
  lastUpdateMs: number;
  isLive: boolean;
  staleSinceMs: number;

  ingest: (payload: TelemetryPayload) => void;
  update: (payload: TelemetryPayload) => void;
  markStale: () => void;
  clearHeld: () => void;
}

let frameCount = 0;
let pendingPayload: TelemetryPayload | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const dropPendingFlush = (): void => {
  if (flushTimer !== null) clearTimeout(flushTimer);
  flushTimer = null;
  pendingPayload = null;
};

const stampsFor = (payload: TelemetryPayload, nowMs: number): SignalStamps =>
  Object.fromEntries(Object.keys(payload).map((key) => [key, nowMs]));

const definedValues = (payload: TelemetryPayload): SignalValues => {
  const defined: SignalValues = {};
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === "number") defined[k as SignalKey] = v;
  }
  return defined;
};

type GetSignals = StoreApi<SignalsState>["getState"];

const scheduleFlush = (get: GetSignals): void => {
  if (flushTimer !== null) return;
  flushTimer = setTimeout(() => {
    const flushed = pendingPayload ?? {};
    flushTimer = null;
    pendingPayload = null;
    get().update(flushed);
  }, DISPLAY_FLUSH_MS);
};

const ingestFrame = (get: GetSignals, payload: TelemetryPayload): void => {
  const defined = definedValues(payload);
  if (Object.keys(defined).length === 0) {
    get().clearHeld();
    return;
  }
  frameCount++;
  pushSample(defined);
  pendingPayload = defined;
  scheduleFlush(get);
};

const displayActions = (set: StoreApi<SignalsState>["setState"]) => ({
  update: (payload: TelemetryPayload) => {
    const nowMs = Date.now();
    set({
      values: payload,
      lastAt: stampsFor(payload, nowMs),
      lastUpdateMs: nowMs,
      isLive: true,
      staleSinceMs: 0,
    });
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
    set({ values: {}, lastAt: {} });
  },
});

export const useSignalsStore = create<SignalsState>()(
  (set, get): SignalsState => ({
    values: {},
    lastAt: {},
    lastUpdateMs: 0,
    isLive: false,
    staleSinceMs: 0,
    ingest: (payload) => {
      ingestFrame(get, payload);
    },
    ...displayActions(set),
  }),
);

export const getFrameCount = (): number => frameCount;

export const useSignalValue = (key: SignalKey): number | undefined => {
  return useSignalsStore((s) => s.values[key]);
};
