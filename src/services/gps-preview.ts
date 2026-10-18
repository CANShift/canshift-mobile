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
import { setGpsAccuracy, setGpsPermission } from "../stores/gps-fix.store";
import { reportFailure } from "../lib/report-dash-failure";
import { STRINGS } from "../strings";

export interface GpsPreviewDeps {
  watcher?: GpsWatcher;
  requestPermission?: () => Promise<ForegroundPermissionResult>;
}

export interface GpsPreview {
  start: () => Promise<void>;
  stop: () => void;
}

const withDefaults = (deps: GpsPreviewDeps): Required<GpsPreviewDeps> => ({
  watcher: deps.watcher ?? expoLocationWatcher,
  requestPermission:
    deps.requestPermission ?? requestForegroundLocationPermission,
});

export const createGpsPreview = (deps: GpsPreviewDeps = {}): GpsPreview => {
  const { watcher, requestPermission } = withDefaults(deps);
  let subscription: GpsSubscription | null = null;
  let generation = 0;

  const attach = async (ticket: number): Promise<void> => {
    try {
      const next = await startGpsSubscription(watcher);
      if (ticket === generation && subscription === null) subscription = next;
      else next.stop();
    } catch (err) {
      reportFailure("GPS preview", err, STRINGS.laps.gpsUnavailable);
    }
  };

  const start = async (): Promise<void> => {
    if (subscription !== null) return;
    const ticket = ++generation;
    const permission = await requestPermission();
    setGpsPermission(permission.granted ? "granted" : "denied");
    if (!permission.granted || ticket !== generation) return;
    await attach(ticket);
  };

  const stop = (): void => {
    generation += 1;
    subscription?.stop();
    subscription = null;
    setGpsAccuracy(null);
  };

  return { start, stop };
};

export const gpsPreview = createGpsPreview();
