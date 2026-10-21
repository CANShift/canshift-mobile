import {
  MAX_GPS_SESSIONS,
  acknowledgeGpsStorageFailure,
  deleteGpsSession,
  hydrateGpsSessions,
  renameGpsSession,
  saveGpsSession,
  setGpsSessionStorage,
  useGpsSessionsStore,
} from "./gps-sessions.store";
import type {
  GpsSessionStorage,
  StoredGpsSession,
} from "../services/gps-session-storage";

const session = (startedAt: number): StoredGpsSession => ({
  key: `g-${String(startedAt)}`,
  startedAt,
  label: "",
  laps: [],
  maxSpeedMs: 0,
  trace: [],
});

const memoryStorage = (
  initial: readonly StoredGpsSession[] = [],
  options: { readFails?: boolean; writes?: () => boolean } = {},
) => {
  let stored = initial;
  const storage: GpsSessionStorage = {
    load: () =>
      Promise.resolve({ value: stored, failed: options.readFails ?? false }),
    save: (sessions) => {
      stored = sessions;
      return Promise.resolve(options.writes?.() ?? true);
    },
  };
  return { storage, snapshot: () => stored };
};

const initialState = useGpsSessionsStore.getState();

describe("GPS sessions store", () => {
  beforeEach(() => {
    useGpsSessionsStore.setState(initialState, true);
  });

  it("appends a finished session to the stored history", async () => {
    const { storage, snapshot } = memoryStorage([session(1)]);
    setGpsSessionStorage(storage);

    await saveGpsSession(session(2));

    expect(snapshot().map((s) => s.key)).toEqual(["g-1", "g-2"]);
    expect(useGpsSessionsStore.getState().sessions).toEqual(snapshot());
  });

  it("drops the oldest sessions past the bound", async () => {
    const full = Array.from({ length: MAX_GPS_SESSIONS }, (_, i) => session(i));
    const { storage, snapshot } = memoryStorage(full);
    setGpsSessionStorage(storage);

    await saveGpsSession(session(999));

    expect(snapshot()).toHaveLength(MAX_GPS_SESSIONS);
    expect(snapshot()[0]?.key).toBe("g-1");
    expect(snapshot().at(-1)?.key).toBe("g-999");
  });

  it("renames and deletes sessions", async () => {
    const { storage, snapshot } = memoryStorage([session(1), session(2)]);
    setGpsSessionStorage(storage);
    await hydrateGpsSessions();

    await renameGpsSession("g-1", " Magny-Cours ");
    await deleteGpsSession("g-2");

    expect(snapshot()).toEqual([{ ...session(1), label: "Magny-Cours" }]);
  });

  it("reports a failed read on the store", async () => {
    setGpsSessionStorage(memoryStorage([], { readFails: true }).storage);
    await hydrateGpsSessions();
    expect(useGpsSessionsStore.getState().storageFailure).toBe("read");
    acknowledgeGpsStorageFailure();
    expect(useGpsSessionsStore.getState().storageFailure).toBeNull();
  });

  it("reports a failed write, and clears it once a write succeeds", async () => {
    let ok = false;
    setGpsSessionStorage(memoryStorage([], { writes: () => ok }).storage);

    await saveGpsSession(session(1));
    expect(useGpsSessionsStore.getState().storageFailure).toBe("write");
    expect(useGpsSessionsStore.getState().sessions).toHaveLength(1);

    ok = true;
    await saveGpsSession(session(2));
    expect(useGpsSessionsStore.getState().storageFailure).toBeNull();
  });
});
