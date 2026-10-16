import { createGpsPreview } from "./gps-preview";
import type { GpsWatcher, GpsWatcherUpdate } from "./gps-subscription";
import { useGpsFixStore } from "../stores/gps-fix.store";
import {
  clearAll,
  getLatestSample,
  useTrackSessionStore,
} from "../stores/track-session.store";

const makeWatcher = () => {
  let emit: (update: GpsWatcherUpdate) => void = () => undefined;
  const detach = jest.fn();
  const start = jest.fn((onUpdate: (update: GpsWatcherUpdate) => void) => {
    emit = onUpdate;
    return Promise.resolve(detach);
  });
  const watcher: GpsWatcher = { start };
  return {
    watcher,
    start,
    detach,
    emit: (update: GpsWatcherUpdate) => {
      emit(update);
    },
  };
};

const UPDATE: GpsWatcherUpdate = {
  t: 1000,
  lat: 46.2,
  lng: 6.1,
  speedMs: 0,
  headingDeg: 0,
  accuracyM: 3,
};

describe("gps preview", () => {
  beforeEach(() => {
    clearAll();
    useGpsFixStore.setState({ permission: "unknown", accuracyM: null });
  });

  it("feeds positions and accuracy before track mode, without recording laps", async () => {
    const { watcher, emit } = makeWatcher();
    const preview = createGpsPreview({
      watcher,
      requestPermission: () => Promise.resolve({ granted: true }),
    });
    await preview.start();
    emit(UPDATE);
    expect(useGpsFixStore.getState()).toEqual({
      permission: "granted",
      accuracyM: 3,
    });
    expect(getLatestSample()?.lat).toBe(46.2);
    expect(useTrackSessionStore.getState().recording).toBe(false);
    preview.stop();
  });

  it("records a refused permission and never starts the watcher", async () => {
    const { watcher, start } = makeWatcher();
    const preview = createGpsPreview({
      watcher,
      requestPermission: () =>
        Promise.resolve({ granted: false, canAskAgain: false }),
    });
    await preview.start();
    expect(useGpsFixStore.getState().permission).toBe("denied");
    expect(start).not.toHaveBeenCalled();
  });

  it("detaches and forgets the accuracy on stop", async () => {
    const { watcher, detach, emit } = makeWatcher();
    const preview = createGpsPreview({
      watcher,
      requestPermission: () => Promise.resolve({ granted: true }),
    });
    await preview.start();
    emit(UPDATE);
    preview.stop();
    expect(detach).toHaveBeenCalled();
    expect(useGpsFixStore.getState().accuracyM).toBeNull();
  });

  it("drops a watcher that arrives after stop", async () => {
    const { watcher, start, detach } = makeWatcher();
    let grant: () => void = () => undefined;
    const preview = createGpsPreview({
      watcher,
      requestPermission: () =>
        new Promise((resolve) => {
          grant = () => {
            resolve({ granted: true });
          };
        }),
    });
    const starting = preview.start();
    preview.stop();
    grant();
    await starting;
    expect(start).not.toHaveBeenCalled();
    expect(detach).not.toHaveBeenCalled();
  });
});
