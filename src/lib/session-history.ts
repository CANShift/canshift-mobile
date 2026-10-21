import type { StoredGpsSession } from "../services/gps-session-storage";
import type { StoredTimerSession } from "../services/timer-session-storage";
import { gpsTimedLaps, timerTimedLaps, type TimedLap } from "./lap-deltas";

export type SessionSource = "gps" | "timer";

export interface HistorySession {
  key: string;
  source: SessionSource;
  startedAt: number;
  label: string;
  laps: readonly TimedLap[];
  maxSpeedMs: number | null;
}

const fromGps = (session: StoredGpsSession): HistorySession => ({
  key: session.key,
  source: "gps",
  startedAt: session.startedAt,
  label: session.label,
  laps: gpsTimedLaps(session.laps),
  maxSpeedMs: session.maxSpeedMs,
});

const fromTimer = (session: StoredTimerSession): HistorySession => ({
  key: session.key,
  source: "timer",
  startedAt: session.startedAt,
  label: session.label,
  laps: timerTimedLaps(session.laps),
  maxSpeedMs: null,
});

export const historySessions = (
  gps: readonly StoredGpsSession[],
  timer: readonly StoredTimerSession[],
): HistorySession[] =>
  [...gps.map(fromGps), ...timer.map(fromTimer)].sort(
    (a, b) => b.startedAt - a.startedAt,
  );
