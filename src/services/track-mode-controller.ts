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

interface ControllerRuntime {
  watcher: GpsWatcher;
  requestPermission: () => Promise<ForegroundPermissionResult>;
  publisher: TrackTelemetryPublisher;
  subscription: GpsSubscription | null;
  startPromise: Promise<TrackModeStartResult> | null;
  generation: number;
}

const runtimeFor = (deps: TrackModeControllerDeps): ControllerRuntime => ({
  watcher: deps.watcher ?? expoLocationWatcher,
  requestPermission:
    deps.requestPermission ?? requestForegroundLocationPermission,
  publisher: publisherFor(deps),
  subscription: null,
  startPromise: null,
  generation: 0,
});

const runStart = async (
  rt: ControllerRuntime,
  gen: number,
): Promise<TrackModeStartResult> => {
  const permission = await rt.requestPermission();
  if (gen !== rt.generation) return notStarted("cancelled");
  if (!permission.granted) return notStarted("permission_denied");
  const gps = await openGps(rt.watcher);
  if (gps === null) return notStarted("gps_unavailable");
  if (gen !== rt.generation) {
    gps.stop();
    return notStarted("cancelled");
  }
  if (!beginSession(gps, rt.publisher)) return notStarted("session_failed");
  rt.subscription = gps;
  log("info", "Track mode started");
  return { started: true };
};

const startTrackMode = (
  rt: ControllerRuntime,
): Promise<TrackModeStartResult> => {
  if (rt.subscription !== null) return Promise.resolve({ started: true });
  rt.startPromise ??= runStart(rt, rt.generation).finally(() => {
    rt.startPromise = null;
  });
  return rt.startPromise;
};

const stopTrackMode = async (rt: ControllerRuntime): Promise<void> => {
  rt.generation += 1;
  if (rt.startPromise !== null) await rt.startPromise.catch(() => undefined);
  if (rt.subscription === null) return;
  rt.subscription.stop();
  rt.subscription = null;
  await endSession(rt.publisher);
  log("info", "Track mode stopped");
};

export const createTrackModeController = (
  deps: TrackModeControllerDeps = {},
): TrackModeController => {
  const rt = runtimeFor(deps);
  return {
    start: () => startTrackMode(rt),
    stop: () => stopTrackMode(rt),
    isActive: () => rt.subscription !== null,
  };
};

export const trackModeController = createTrackModeController();
