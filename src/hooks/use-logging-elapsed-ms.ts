import { useEffect, useState } from "react";
import { useTrackSessionStore } from "../stores/track-session.store";

const TICK_INTERVAL_MS = 1000;

export const useLoggingElapsedMs = (): number => {
  const recording = useTrackSessionStore((s) => s.recording);
  const sessionStartMs = useTrackSessionStore((s) => s.sessionStartMs);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!recording) {
      setElapsedMs(0);
      return;
    }
    const sync = () => {
      setElapsedMs(Math.max(0, Date.now() - sessionStartMs));
    };
    sync();
    const id = setInterval(sync, TICK_INTERVAL_MS);
    return () => {
      clearInterval(id);
    };
  }, [recording, sessionStartMs]);

  return elapsedMs;
};
