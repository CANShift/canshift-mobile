import { formatLapMs } from "../../lib/lap-time";
import type { SessionLap } from "../../lib/timer-laps";
import type { LapRecord } from "../../stores/track-session.store";
import { formatTimerElapsed } from "../widgets/widget-value";

export interface LapRow {
  key: string;
  label: string;
  lapText: string;
  totalText: string | null;
  isBest: boolean;
}

const MIN_LAPS_FOR_TIMER_BEST = 2;

const fastestTimerLapIndex = (laps: readonly SessionLap[]): number | null => {
  const first = laps[0];
  if (laps.length < MIN_LAPS_FOR_TIMER_BEST || first === undefined) return null;
  return laps.reduce(
    (best, lap) => (lap.lapMs < best.lapMs ? lap : best),
    first,
  ).index;
};

export const timerLapRows = (laps: readonly SessionLap[]): LapRow[] => {
  const bestIndex = fastestTimerLapIndex(laps);
  return [...laps].reverse().map((lap) => ({
    key: String(lap.index),
    label: `Lap ${String(lap.index)}`,
    lapText: formatTimerElapsed(lap.lapMs, true),
    totalText: formatTimerElapsed(lap.totalMs, true),
    isBest: lap.index === bestIndex,
  }));
};

export const trackLapRows = (
  laps: readonly LapRecord[],
  bestLapMs: number,
): LapRow[] =>
  [...laps].reverse().map((lap) => ({
    key: String(lap.number),
    label: `Lap ${String(lap.number)}`,
    lapText: formatLapMs(lap.durationMs),
    totalText: null,
    isBest: lap.durationMs === bestLapMs,
  }));
