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

export const MAX_STORED_SESSIONS = 50;

interface TimerSessionsState {
  hydrated: boolean;
  sessions: StoredTimerSession[];
  activeKey: string | null;
  activeBucket: ActiveBucket | null;
  persistFailed: boolean;
}

let s_storage: TimerSessionStorage = fileTimerSessionStorage;

export const setTimerSessionStorage = (storage: TimerSessionStorage): void => {
  s_storage = storage;
};

export const useTimerSessionsStore = create<TimerSessionsState>()(() => ({
  hydrated: false,
  sessions: [],
  activeKey: null,
  activeBucket: null,
  persistFailed: false,
}));

const persistSessions = (sessions: readonly StoredTimerSession[]): void => {
  void s_storage.save(sessions).then((persisted) => {
    useTimerSessionsStore.setState({ persistFailed: !persisted });
  });
};

export const acknowledgePersistFailure = (): void => {
  useTimerSessionsStore.setState({ persistFailed: false });
};

export const hydrateTimerSessions = async (): Promise<void> => {
  if (useTimerSessionsStore.getState().hydrated) return;
  const stored = await s_storage.load();
  const recordedBeforeHydration = useTimerSessionsStore.getState().sessions;
  const storedKeys = new Set(
    recordedBeforeHydration.map((session) => session.key),
  );
  const sessions = [
    ...stored.filter((session) => !storedKeys.has(session.key)),
    ...recordedBeforeHydration,
  ].slice(-MAX_STORED_SESSIONS);
  useTimerSessionsStore.setState({ hydrated: true, sessions });
  if (recordedBeforeHydration.length > 0) persistSessions(sessions);
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

export const clearTimerSessions = (): void => {
  useTimerSessionsStore.setState({
    hydrated: true,
    sessions: [],
    activeKey: null,
    activeBucket: null,
  });
  persistSessions([]);
};
