import { bestLapMs, type TimedLap } from "./lap-deltas";

export interface SessionStats {
  lapCount: number;
  bestMs: number | null;
  averageMs: number | null;
  spreadMs: number | null;
}

const sumMs = (laps: readonly TimedLap[]): number =>
  laps.reduce((total, lap) => total + lap.ms, 0);

const standardDeviationMs = (
  laps: readonly TimedLap[],
  meanMs: number,
): number => {
  const variance =
    laps.reduce((total, lap) => total + (lap.ms - meanMs) ** 2, 0) /
    laps.length;
  return Math.sqrt(variance);
};

export const sessionStats = (laps: readonly TimedLap[]): SessionStats => {
  const averageMs = laps.length === 0 ? null : sumMs(laps) / laps.length;
  return {
    lapCount: laps.length,
    bestMs: bestLapMs(laps),
    averageMs,
    spreadMs:
      averageMs === null || laps.length < 2
        ? null
        : standardDeviationMs(laps, averageMs),
  };
};
