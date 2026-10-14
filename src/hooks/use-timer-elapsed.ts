import { useCallback } from "react";
import {
  elapsedMsOf,
  useTimerStore,
  type TimerStatus,
} from "../stores/timer.store";
import { useTickingMs } from "./use-ticking-ms";

export const useTimerElapsed = (status: TimerStatus): number => {
  const startedAt = useTimerStore((s) => s.startedAt);
  const accumulatedMs = useTimerStore((s) => s.accumulatedMs);
  const readMs = useCallback(
    () => elapsedMsOf({ status, startedAt, accumulatedMs }),
    [status, startedAt, accumulatedMs],
  );
  return useTickingMs(readMs, status === "running");
};
