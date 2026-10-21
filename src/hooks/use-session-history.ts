import { useEffect, useMemo } from "react";
import {
  acknowledgeGpsStorageFailure,
  hydrateGpsSessions,
  useGpsSessionsStore,
  type StorageFailure,
} from "../stores/gps-sessions.store";
import {
  acknowledgePersistFailure,
  hydrateTimerSessions,
  useTimerSessionsStore,
} from "../stores/timer-sessions.store";
import { historySessions, type HistorySession } from "../lib/session-history";
import { STORAGE_NOTES } from "../lib/session-view";

export interface SessionHistoryModel {
  sessions: readonly HistorySession[];
  storageNote: string | null;
  dismissStorageNote: () => void;
}

const useStorageFailure = (): StorageFailure | null => {
  const gpsFailure = useGpsSessionsStore((s) => s.storageFailure);
  const timerFailed = useTimerSessionsStore((s) => s.persistFailed);
  return gpsFailure ?? (timerFailed ? "write" : null);
};

const dismissStorageNote = (): void => {
  acknowledgeGpsStorageFailure();
  acknowledgePersistFailure();
};

export const useSessionHistory = (): SessionHistoryModel => {
  const gps = useGpsSessionsStore((s) => s.sessions);
  const timer = useTimerSessionsStore((s) => s.sessions);
  const failure = useStorageFailure();
  useEffect(() => {
    void hydrateGpsSessions();
    void hydrateTimerSessions();
  }, []);
  const sessions = useMemo(() => historySessions(gps, timer), [gps, timer]);
  return {
    sessions,
    storageNote: failure === null ? null : STORAGE_NOTES[failure],
    dismissStorageNote,
  };
};
