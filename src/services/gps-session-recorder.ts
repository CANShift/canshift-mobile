import {
  getRange,
  getWriteIndex,
  useTrackSessionStore,
} from "../stores/track-session.store";
import { saveGpsSession } from "../stores/gps-sessions.store";
import { maxSpeedMs, thinTrace } from "../lib/gps-trace";
import type { StoredGpsSession } from "./gps-session-storage";

export const MIN_SAVED_TRACE_POINTS = 10;

export const finishedGpsSession = (): StoredGpsSession | null => {
  const { sessionStartMs, sessionStartSampleIndex, laps } =
    useTrackSessionStore.getState();
  const samples = getRange(sessionStartSampleIndex, getWriteIndex());
  if (laps.length === 0 && samples.length < MIN_SAVED_TRACE_POINTS) return null;
  return {
    key: `g-${String(sessionStartMs)}`,
    startedAt: sessionStartMs,
    label: "",
    laps: [...laps],
    maxSpeedMs: maxSpeedMs(samples),
    trace: thinTrace(samples),
  };
};

export const recordFinishedGpsSession = async (): Promise<void> => {
  const session = finishedGpsSession();
  if (session === null) return;
  await saveGpsSession(session);
};
