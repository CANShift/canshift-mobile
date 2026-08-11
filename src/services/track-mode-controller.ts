import type { TrackTelemetry } from "@canshift/core";
import {
  startGpsSubscription,
  type GpsSubscription,
  type GpsWatcher,
} from "./gps-subscription";
import {
  expoLocationWatcher,
  requestForegroundLocationPermission,
  type ForegroundPermissionResult,
} from "./gps-watcher.expo";
import {
  createTrackTelemetryPublisher,
  type TrackTelemetryWriter,
} from "./track-telemetry-publisher";
import { sendCmd, type CmdPayload } from "./ble.service";
import { useDeviceStore } from "../stores/device.store";
import { startSession, stopSession } from "../stores/track-session.store";
import { log } from "../stores/log.store";
import { errText } from "../lib/error-text";

export type TrackModeStartResult =
  | { started: true }
  | {
      started: false;
      reason:
        | "permission_denied"
        | "gps_unavailable"
        | "session_failed"
        | "cancelled";
    };

export interface TrackModeControllerDeps {
  watcher?: GpsWatcher;
  requestPermission?: () => Promise<ForegroundPermissionResult>;
  write?: TrackTelemetryWriter;
  publisherIntervalMs?: number;
  now?: () => number;
}

export interface TrackModeController {
  start(): Promise<TrackModeStartResult>;
  stop(): Promise<void>;
  isActive(): boolean;
}

const OPTIONAL_TRACK_FIELDS = [
  "currentLapMs",
  "lastLapMs",
  "bestLapMs",
  "lapNumber",
  "deltaMs",
  "isBestLap",
] as const;

export const toTrackStateCmd = (telemetry: TrackTelemetry): CmdPayload => {
  const payload: CmdPayload = { trackMode: telemetry.trackMode };
  for (const field of OPTIONAL_TRACK_FIELDS) {
    const value = telemetry[field];
    if (value !== undefined) payload[field] = value;
  }
  return payload;
};

const writeTrackStateOverBle: TrackTelemetryWriter = async (telemetry) => {
  const { connectionState, mode } = useDeviceStore.getState();
  if (connectionState !== "connected" || mode !== "ble") return;
  await sendCmd("track_state", toTrackStateCmd(telemetry));
};

export const createTrackModeController = (
  deps: TrackModeControllerDeps = {},
): TrackModeController => {
  const watcher = deps.watcher ?? expoLocationWatcher;
  const requestPermission =
    deps.requestPermission ?? requestForegroundLocationPermission;
  const publisher = createTrackTelemetryPublisher({
    write: deps.write ?? writeTrackStateOverBle,
    ...(deps.publisherIntervalMs !== undefined
      ? { intervalMs: deps.publisherIntervalMs }
      : {}),
    ...(deps.now !== undefined ? { now: deps.now } : {}),
  });

  let subscription: GpsSubscription | null = null;
  let startPromise: Promise<TrackModeStartResult> | null = null;
  let generation = 0;

  const rollbackStart = (started: GpsSubscription): void => {
    started.stop();
    stopSession();
  };

  const doStart = async (gen: number): Promise<TrackModeStartResult> => {
    const permission = await requestPermission();
    if (gen !== generation) return { started: false, reason: "cancelled" };
    if (!permission.granted)
      return { started: false, reason: "permission_denied" };
    let nextSubscription: GpsSubscription;
    try {
      nextSubscription = await startGpsSubscription(watcher);
    } catch (err) {
      const detail = errText(err);
      log("warn", `Track mode: GPS watcher failed to start — ${detail}`);
      return { started: false, reason: "gps_unavailable" };
    }
    if (gen !== generation) {
      nextSubscription.stop();
      return { started: false, reason: "cancelled" };
    }
    try {
      startSession();
      publisher.start();
    } catch (err) {
      rollbackStart(nextSubscription);
      log("warn", `Track mode: session failed to start — ${errText(err)}`);
      return { started: false, reason: "session_failed" };
    }
    subscription = nextSubscription;
    log("info", "Track mode started");
    return { started: true };
  };

  const start = (): Promise<TrackModeStartResult> => {
    if (subscription !== null) return Promise.resolve({ started: true });
    startPromise ??= doStart(generation).finally(() => {
      startPromise = null;
    });
    return startPromise;
  };

  const stop = async (): Promise<void> => {
    generation += 1;
    if (startPromise !== null) await startPromise.catch(() => undefined);
    if (subscription === null) return;
    subscription.stop();
    subscription = null;
    try {
      stopSession();
    } finally {
      publisher.stop();
      await publisher.tickNow();
    }
    log("info", "Track mode stopped");
  };

  const isActive = (): boolean => subscription !== null;

  return { start, stop, isActive };
};

export const trackModeController = createTrackModeController();
