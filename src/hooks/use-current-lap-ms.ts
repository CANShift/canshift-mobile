import { useCallback } from "react";
import {
  lapStartMs,
  useTrackSessionStore,
} from "../stores/track-session.store";
import { useTickingMs } from "./use-ticking-ms";

export const useCurrentLapMs = (): number => {
  const recording = useTrackSessionStore((s) => s.recording);
  const startMs = useTrackSessionStore((s) =>
    lapStartMs(s.laps, s.sessionStartMs),
  );
  const readMs = useCallback(
    () => (recording ? Math.max(0, Date.now() - startMs) : 0),
    [recording, startMs],
  );
  return useTickingMs(readMs, recording);
};
