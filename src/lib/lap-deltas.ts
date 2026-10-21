import { STRINGS } from "../strings";
import { formatChrono, formatDelta } from "./lap-time";
import type { LapRecord } from "../stores/track-session.store";
import type { SessionLap } from "./timer-laps";

export interface TimedLap {
  number: number;
  ms: number;
}

export const gpsTimedLaps = (laps: readonly LapRecord[]): TimedLap[] =>
  laps.map((lap) => ({ number: lap.number, ms: lap.durationMs }));

export const timerTimedLaps = (laps: readonly SessionLap[]): TimedLap[] =>
  laps.map((lap) => ({ number: lap.index, ms: lap.lapMs }));

export interface LapLine {
  key: string;
  label: string;
  time: string;
  delta: string;
  isBest: boolean;
}

export const bestLapMs = (laps: readonly TimedLap[]): number | null =>
  laps.length === 0 ? null : Math.min(...laps.map((lap) => lap.ms));

export const lapLines = (laps: readonly TimedLap[]): LapLine[] => {
  const best = bestLapMs(laps);
  return [...laps].reverse().map((lap) => {
    const isBest = lap.ms === best;
    return {
      key: String(lap.number),
      label: STRINGS.laps.lapNumber(lap.number),
      time: formatChrono(lap.ms),
      delta: isBest ? STRINGS.laps.bestTag : formatDelta(lap.ms - (best ?? 0)),
      isBest,
    };
  });
};

export const lastVsBest = (laps: readonly TimedLap[]): number | null => {
  const last = laps[laps.length - 1];
  const best = bestLapMs(laps);
  if (last === undefined || best === null || laps.length < 2) return null;
  return last.ms - best;
};
