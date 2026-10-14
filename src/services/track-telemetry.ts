import type { TrackTelemetry } from "@canshift/core";
import { lapStartMs, type LapRecord } from "../stores/track-session.store";

export interface BuildTrackTelemetryInput {
  recording: boolean;
  sessionStartMs: number;
  laps: readonly LapRecord[];
  bestLapMs: number;
  nowMs: number;
  bestLapPulse?: boolean;
}

export const buildTrackTelemetry = (
  input: BuildTrackTelemetryInput,
): TrackTelemetry => {
  const { recording, sessionStartMs, laps, bestLapMs, nowMs, bestLapPulse } =
    input;
  const payload: TrackTelemetry = { trackMode: recording };
  if (!recording) return payload;

  const startMs = lapStartMs(laps, sessionStartMs);
  const currentLapMs = Math.max(0, Math.floor(nowMs - startMs));
  payload.currentLapMs = currentLapMs;
  payload.lapNumber = laps.length;

  if (laps.length > 0) {
    const lastLap = laps[laps.length - 1];
    if (lastLap !== undefined) payload.lastLapMs = lastLap.durationMs;
  }

  if (bestLapMs > 0) {
    payload.bestLapMs = bestLapMs;
    payload.deltaMs = currentLapMs - bestLapMs;
  }

  if (bestLapPulse === true) payload.isBestLap = true;

  return payload;
};
