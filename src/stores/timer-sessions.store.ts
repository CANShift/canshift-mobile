import { create } from "zustand";
import {
  insertLap,
  startsNewBucket,
  type ActiveBucket,
  type IncomingLap,
} from "../lib/timer-laps";
import {
  fileTimerSessionStorage,
  type StoredTimerSession,
  type TimerSessionStorage,
} from "../services/timer-session-storage";
import { relabel, withoutSession } from "../lib/session-label";
import type { ReadFailure } from "../lib/json-file-storage";

export const MAX_STORED_SESSIONS = 50;

interface TimerSessionsState {
  hydrated: boolean;
  sessions: StoredTimerSession[];
  activeKey: string | null;
  activeBucket: ActiveBucket | null;
  persistFailed: boolean;
  readFailure: ReadFailure | null;
}

let activeStorage: TimerSessionStorage = fileTimerSessionStorage;
let hydration: Promise<void> | null = null;

export const setTimerSessionStorage = (storage: TimerSessionStorage): void => {
  activeStorage = storage;
  hydration = null;
};

export const useTimerSessionsStore = create<TimerSessionsState>()(() => ({
  hydrated: false,
  sessions: [],
  activeKey: null,
  activeBucket: null,
  persistFailed: false,
  readFailure: null,
}));

const persistSessions = (sessions: readonly StoredTimerSession[]): void => {
  void activeStorage.save(sessions).then((persisted) => {
    useTimerSessionsStore.setState({ persistFailed: !persisted });
  });
};

export const acknowledgePersistFailure = (): void => {
  useTimerSessionsStore.setState({ persistFailed: false });
};

export const acknowledgeTimerReadFailure = (): void => {
  useTimerSessionsStore.setState({ readFailure: null });
};

const loadStored = async (): Promise<void> => {
  const { value: stored, failure } = await activeStorage.load();
  const recordedBeforeHydration = useTimerSessionsStore.getState().sessions;
  const storedKeys = new Set(
    recordedBeforeHydration.map((session) => session.key),
  );
  const sessions = [
    ...stored.filter((session) => !storedKeys.has(session.key)),
    ...recordedBeforeHydration,
  ].slice(-MAX_STORED_SESSIONS);
  useTimerSessionsStore.setState({
    hydrated: true,
    sessions,
    readFailure: failure,
  });
  if (recordedBeforeHydration.length > 0) persistSessions(sessions);
};

export const hydrateTimerSessions = (): Promise<void> => {
  if (useTimerSessionsStore.getState().hydrated) return Promise.resolve();
  hydration ??= loadStored();
  return hydration;
};

type LapEntry = StoredTimerSession["laps"][number];

interface LapPlacement {
  sessions: StoredTimerSession[];
  activeKey: string;
  lastIndex: number;
}

const openNewSession = (
  state: TimerSessionsState,
  lap: IncomingLap,
  lapEntry: LapEntry,
  nowMs: number,
): LapPlacement => {
  const activeKey = `s-${String(nowMs)}-${String(lap.sessionId)}`;
  const session: StoredTimerSession = {
    key: activeKey,
    startedAt: nowMs - lap.totalMs,
    label: "",
    laps: [lapEntry],
  };
  return {
    sessions: [...state.sessions, session].slice(-MAX_STORED_SESSIONS),
    activeKey,
    lastIndex: lap.index,
  };
};

const appendToActiveSession = (
  state: TimerSessionsState,
  lap: IncomingLap,
  lapEntry: LapEntry,
  activeKey: string,
): LapPlacement => ({
  sessions: state.sessions.map((session) =>
    session.key === activeKey
      ? { ...session, laps: insertLap(session.laps, lapEntry) }
      : session,
  ),
  activeKey,
  lastIndex: Math.max(state.activeBucket?.lastIndex ?? 0, lap.index),
});

export const recordSessionLap = (
  lap: IncomingLap,
  nowMs: number = Date.now(),
): void => {
  const state = useTimerSessionsStore.getState();
  const lapEntry = { index: lap.index, lapMs: lap.lapMs, totalMs: lap.totalMs };

  const placement =
    startsNewBucket(state.activeBucket, lap) || state.activeKey === null
      ? openNewSession(state, lap, lapEntry, nowMs)
      : appendToActiveSession(state, lap, lapEntry, state.activeKey);

  useTimerSessionsStore.setState({
    sessions: placement.sessions,
    activeKey: placement.activeKey,
    activeBucket: { sessionId: lap.sessionId, lastIndex: placement.lastIndex },
  });
  if (state.hydrated) persistSessions(placement.sessions);
};

export const clearTimerSessions = async (): Promise<void> => {
  await hydrateTimerSessions();
  useTimerSessionsStore.setState({
    sessions: [],
    activeKey: null,
    activeBucket: null,
  });
  persistSessions([]);
};

const replaceSessions = (sessions: StoredTimerSession[]): void => {
  useTimerSessionsStore.setState({ sessions });
  persistSessions(sessions);
};

export const renameTimerSession = (key: string, label: string): void => {
  replaceSessions(
    relabel(useTimerSessionsStore.getState().sessions, key, label),
  );
};

export const deleteTimerSession = (key: string): void => {
  const { activeKey, sessions } = useTimerSessionsStore.getState();
  if (activeKey === key)
    useTimerSessionsStore.setState({ activeKey: null, activeBucket: null });
  replaceSessions(withoutSession(sessions, key));
};
