import type { z } from "zod";
import { TrackTelemetrySchema, type TrackTelemetry } from "@canshift/core";
import { log } from "../stores/log.store";
import { useTrackSessionStore } from "../stores/track-session.store";
import { buildTrackTelemetry } from "./track-telemetry";
import { errText } from "../lib/error-text";

export type TrackTelemetryWriter = (payload: TrackTelemetry) => Promise<void>;

export interface TrackTelemetryPublisherDeps {
  write: TrackTelemetryWriter;
  intervalMs?: number;
  now?: () => number;
  onError?: (err: unknown) => void;
}

export interface TrackTelemetryPublisher {
  start(): void;
  stop(): void;
  tickNow(): Promise<void>;
}

const DEFAULT_INTERVAL_MS = 1000;

type TrackSessionState = ReturnType<typeof useTrackSessionStore.getState>;

const logPublishError = (err: unknown): void => {
  log("warn", `TrackTelemetry publish failed: ${errText(err)}`);
};

const improvedBest = (bestLapMs: number, prevBestLapMs: number): boolean =>
  bestLapMs > 0 &&
  bestLapMs !== prevBestLapMs &&
  (prevBestLapMs === 0 || bestLapMs < prevBestLapMs);

const payloadFor = (
  state: TrackSessionState,
  bestLapPulse: boolean,
  nowMs: number,
): TrackTelemetry =>
  buildTrackTelemetry({
    recording: state.recording,
    sessionStartMs: state.sessionStartMs,
    laps: state.laps,
    bestLapMs: state.bestLapMs,
    nowMs,
    bestLapPulse,
  });

type SchemaIssue = z.core.$ZodIssue;

const validationError = (issues: readonly SchemaIssue[]): Error =>
  new Error(
    `TrackTelemetry payload failed schema validation: ${issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")}`,
  );

const writeValidated = async (
  payload: TrackTelemetry,
  write: TrackTelemetryWriter,
  onError: (err: unknown) => void,
): Promise<void> => {
  const parsed = TrackTelemetrySchema.safeParse(payload);
  if (!parsed.success) {
    onError(validationError(parsed.error.issues));
    return;
  }
  try {
    await write(parsed.data);
  } catch (err) {
    onError(err);
  }
};

const repeat = (
  tick: () => Promise<void>,
  intervalMs: number,
): ReturnType<typeof setInterval> =>
  setInterval(() => {
    void tick();
  }, intervalMs);

export const createTrackTelemetryPublisher = (
  deps: TrackTelemetryPublisherDeps,
): TrackTelemetryPublisher => {
  const now = deps.now ?? Date.now;
  const onError = deps.onError ?? logPublishError;
  let handle: ReturnType<typeof setInterval> | null = null;
  let prevBestLapMs = 0;
  let pendingPulse = false;

  const tick = async (): Promise<void> => {
    const state = useTrackSessionStore.getState();
    if (improvedBest(state.bestLapMs, prevBestLapMs)) pendingPulse = true;
    prevBestLapMs = state.bestLapMs;
    const payload = payloadFor(state, pendingPulse, now());
    pendingPulse = false;
    await writeValidated(payload, deps.write, onError);
  };

  const start = (): void => {
    if (handle !== null) return;
    void tick();
    handle = repeat(tick, deps.intervalMs ?? DEFAULT_INTERVAL_MS);
  };
  const stop = (): void => {
    if (handle !== null) clearInterval(handle);
    handle = null;
    prevBestLapMs = 0;
    pendingPulse = false;
  };
  return { start, stop, tickNow: tick };
};
