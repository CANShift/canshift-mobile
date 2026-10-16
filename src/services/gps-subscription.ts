import { pushSample } from "../stores/track-session.store";
import { setGpsAccuracy } from "../stores/gps-fix.store";

export interface GpsWatcherUpdate {
  t: number;
  lat: number;
  lng: number;
  speedMs: number | null;
  headingDeg: number | null;
  accuracyM: number | null;
}

export interface GpsWatcher {
  start(onUpdate: (update: GpsWatcherUpdate) => void): Promise<() => void>;
}

export interface GpsSubscription {
  stop(): void;
}

export const startGpsSubscription = async (
  watcher: GpsWatcher,
): Promise<GpsSubscription> => {
  const detach = await watcher.start((update) => {
    setGpsAccuracy(update.accuracyM);
    pushSample({
      t: update.t,
      lat: update.lat,
      lng: update.lng,
      speedMs: update.speedMs ?? 0,
      headingDeg: update.headingDeg ?? 0,
    });
  });
  let stopped = false;
  return {
    stop() {
      if (stopped) return;
      stopped = true;
      detach();
    },
  };
};
