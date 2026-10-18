import { DEVICE_COMMANDS, type TrackTelemetry } from "@canshift/core";
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
  type TrackTelemetryPublisher,
  type TrackTelemetryWriter,
} from "./track-telemetry-publisher";
import { sendCmd, type CmdPayload } from "./ble.service";
import { useDeviceStore } from "../stores/device.store";
import { startSession, stopSession } from "../stores/track-session.store";
import { log } from "../stores/log.store";
import { errText } from "../lib/error-text";

export type TrackModeStartFailure =
  "permission_denied" | "gps_unavailable" | "session_failed" | "cancelled";

export type TrackModeStartResult =
  { started: true } | { started: false; reason: TrackModeStartFailure };

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
  await sendCmd(DEVICE_COMMANDS.trackState, toTrackStateCmd(telemetry));
};

const notStarted = (reason: TrackModeStartFailure): TrackModeStartResult => ({
  started: false,
  reason,
});

const publisherFor = (deps: TrackModeControllerDeps): TrackTelemetryPublisher =>
  createTrackTelemetryPublisher({
    write: deps.write ?? writeTrackStateOverBle,
    ...(deps.publisherIntervalMs !== undefined
      ? { intervalMs: deps.publisherIntervalMs }
      : {}),
    ...(deps.now !== undefined ? { now: deps.now } : {}),
  });

const openGps = async (
  watcher: GpsWatcher,
): Promise<GpsSubscription | null> => {
  try {
    return await startGpsSubscription(watcher);
  } catch (err) {
    log("warn", `Track mode: GPS watcher failed to start — ${errText(err)}`);
    return null;
  }
};

const beginSession = (
  gps: GpsSubscription,
  publisher: TrackTelemetryPublisher,
): boolean => {
  try {
    startSession();
    publisher.start();
    return true;
  } catch (err) {
    gps.stop();
    stopSession();
    log("warn", `Track mode: session failed to start — ${errText(err)}`);
    return false;
  }
};

const endSession = async (
  publisher: TrackTelemetryPublisher,
): Promise<void> => {
  try {
    stopSession();
  } finally {
    publisher.stop();
    await publisher.tickNow();
  }
};

export const createTrackModeController = (
  deps: TrackModeControllerDeps = {},
): TrackModeController => {
  const watcher = deps.watcher ?? expoLocationWatcher;
  const requestPermission =
    deps.requestPermission ?? requestForegroundLocationPermission;
  const publisher = publisherFor(deps);

  let subscription: GpsSubscription | null = null;
  let startPromise: Promise<TrackModeStartResult> | null = null;
  let generation = 0;

  const doStart = async (gen: number): Promise<TrackModeStartResult> => {
    const permission = await requestPermission();
    if (gen !== generation) return notStarted("cancelled");
    if (!permission.granted) return notStarted("permission_denied");
    const gps = await openGps(watcher);
    if (gps === null) return notStarted("gps_unavailable");
    if (gen !== generation) {
      gps.stop();
      return notStarted("cancelled");
    }
    if (!beginSession(gps, publisher)) return notStarted("session_failed");
    subscription = gps;
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
    await endSession(publisher);
    log("info", "Track mode stopped");
  };

  return { start, stop, isActive: () => subscription !== null };
};

export const trackModeController = createTrackModeController();
