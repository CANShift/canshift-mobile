import { useEffect, useMemo, useState } from "react";
import { useTimerStore, type TimerStatus } from "../stores/timer.store";
import {
  acknowledgePersistFailure,
  hydrateTimerSessions,
  useTimerSessionsStore,
} from "../stores/timer-sessions.store";
import { timerControl } from "../services/timer-control";
import type { TimedLap } from "../lib/lap-deltas";
import { useTimerElapsed } from "./use-timer-elapsed";

export interface DashTimerModel {
  status: TimerStatus;
  synced: boolean;
  elapsedMs: number;
  laps: readonly TimedLap[];
  persistFailed: boolean;
  dismissPersistFailure: () => void;
  confirmingReset: boolean;
  askReset: () => void;
  cancelReset: () => void;
  confirmReset: () => void;
}

const useTimerLaps = (): readonly TimedLap[] => {
  const laps = useTimerStore((s) => s.laps);
  return useMemo(
    () => laps.map((lap) => ({ number: lap.index, ms: lap.lapMs })),
    [laps],
  );
};

export const useDashTimer = (): DashTimerModel => {
  const status = useTimerStore((s) => s.status);
  const synced = useTimerStore((s) => s.deviceSynced);
  const persistFailed = useTimerSessionsStore((s) => s.persistFailed);
  const [confirmingReset, setConfirmingReset] = useState(false);
  useEffect(() => {
    void hydrateTimerSessions();
  }, []);
  return {
    status,
    synced,
    elapsedMs: useTimerElapsed(status),
    laps: useTimerLaps(),
    persistFailed,
    dismissPersistFailure: acknowledgePersistFailure,
    confirmingReset,
    askReset: () => {
      setConfirmingReset(true);
    },
    cancelReset: () => {
      setConfirmingReset(false);
    },
    confirmReset: () => {
      setConfirmingReset(false);
      timerControl.reset();
    },
  };
};
