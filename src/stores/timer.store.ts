import { create, type StoreApi } from "zustand";
import type { TimerBleLap, TimerBleState } from "@canshift/core/wire";
import {
  insertLap,
  type IncomingLap,
  type SessionLap,
} from "../lib/timer-laps";

export type TimerStatus = "idle" | "running" | "paused";

const LOCAL_SESSION_ID = -1;

interface TimerState {
  status: TimerStatus;
  startedAt: number | null;
  accumulatedMs: number;
  laps: SessionLap[];
  sessionId: number | null;
  deviceSynced: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  reset: () => void;
  captureLocalLap: (atMs?: number) => IncomingLap | null;
  applyDeviceState: (state: TimerBleState, atMs?: number) => void;
  applyDeviceLap: (lap: TimerBleLap) => void;
  clearDeviceSync: () => void;
}

const STATUS_BY_RUN_STATE: Record<TimerBleState["state"], TimerStatus> = {
  reset: "idle",
  running: "running",
  paused: "paused",
};

type SetTimer = StoreApi<TimerState>["setState"];
type GetTimer = StoreApi<TimerState>["getState"];

const runActions = (set: SetTimer, get: GetTimer) => ({
  start: () => {
    if (get().status !== "idle") return;
    set({
      status: "running",
      startedAt: Date.now(),
      accumulatedMs: 0,
      laps: [],
      sessionId: LOCAL_SESSION_ID,
    });
  },
  pause: () => {
    const { status, startedAt, accumulatedMs } = get();
    if (status !== "running" || startedAt === null) return;
    set({
      status: "paused",
      startedAt: null,
      accumulatedMs: accumulatedMs + Math.max(0, Date.now() - startedAt),
    });
  },
  resume: () => {
    if (get().status !== "paused") return;
    set({ status: "running", startedAt: Date.now() });
  },
  reset: () => {
    set({ status: "idle", startedAt: null, accumulatedMs: 0, laps: [] });
  },
});

const toggleRun = (get: GetTimer): void => {
  const state = get();
  const next: Record<TimerStatus, () => void> = {
    idle: state.start,
    running: state.pause,
    paused: state.resume,
  };
  next[state.status]();
};

const nextLocalLap = (state: TimerState, atMs: number): IncomingLap => {
  const totalMs = elapsedMsOf(state, atMs);
  const previousTotalMs = state.laps.reduce(
    (max, lap) => Math.max(max, lap.totalMs),
    0,
  );
  return {
    sessionId: state.sessionId ?? LOCAL_SESSION_ID,
    index: state.laps.length + 1,
    lapMs: Math.max(0, totalMs - previousTotalMs),
    totalMs,
  };
};

const captureLap = (
  set: SetTimer,
  get: GetTimer,
  atMs: number,
): IncomingLap | null => {
  const state = get();
  if (state.status !== "running") return null;
  const lap = nextLocalLap(state, atMs);
  set({ laps: insertLap(state.laps, lap) });
  return lap;
};

const deviceActions = (set: SetTimer, get: GetTimer) => ({
  applyDeviceState: (deviceState: TimerBleState, atMs = Date.now()) => {
    const { sessionId, laps } = get();
    const sameSession = sessionId === deviceState.sessionId;
    const keepLaps = sameSession && deviceState.lapCount > 0;
    set({
      status: STATUS_BY_RUN_STATE[deviceState.state],
      accumulatedMs: deviceState.elapsedMs,
      startedAt: deviceState.state === "running" ? atMs : null,
      sessionId: deviceState.sessionId,
      deviceSynced: true,
      laps: keepLaps ? laps : [],
    });
  },
  applyDeviceLap: (lap: TimerBleLap) => {
    const { sessionId, laps } = get();
    if (sessionId !== null && lap.sessionId !== sessionId) return;
    set({
      laps: insertLap(laps, {
        index: lap.index,
        lapMs: lap.lapMs,
        totalMs: lap.totalMs,
      }),
      sessionId: lap.sessionId,
    });
  },
  clearDeviceSync: () => {
    set({ deviceSynced: false });
  },
});

export const useTimerStore = create<TimerState>()((set, get): TimerState => ({
  status: "idle",
  startedAt: null,
  accumulatedMs: 0,
  laps: [],
  sessionId: null,
  deviceSynced: false,
  ...runActions(set, get),
  toggle: () => {
    toggleRun(get);
  },
  captureLocalLap: (atMs = Date.now()) => captureLap(set, get, atMs),
  ...deviceActions(set, get),
}));

export const elapsedMsOf = (
  state: Pick<TimerState, "status" | "startedAt" | "accumulatedMs">,
  atMs: number = Date.now(),
): number => {
  if (state.status === "running" && state.startedAt !== null) {
    return state.accumulatedMs + Math.max(0, atMs - state.startedAt);
  }
  return state.accumulatedMs;
};
