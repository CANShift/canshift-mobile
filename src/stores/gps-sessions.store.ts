import { create } from "zustand";
import {
  fileGpsSessionStorage,
  type GpsSessionStorage,
  type StoredGpsSession,
} from "../services/gps-session-storage";
import { relabel, withoutSession } from "../lib/session-label";
import type { ReadFailure } from "../lib/json-file-storage";

export const MAX_GPS_SESSIONS = 20;

export type StorageFailure = ReadFailure | "write";

interface GpsSessionsState {
  hydrated: boolean;
  sessions: StoredGpsSession[];
  storageFailure: StorageFailure | null;
}

let activeStorage: GpsSessionStorage = fileGpsSessionStorage;
let hydration: Promise<void> | null = null;

export const setGpsSessionStorage = (storage: GpsSessionStorage): void => {
  activeStorage = storage;
  hydration = null;
};

export const useGpsSessionsStore = create<GpsSessionsState>()(() => ({
  hydrated: false,
  sessions: [],
  storageFailure: null,
}));

const loadStored = async (): Promise<void> => {
  const { value, failure } = await activeStorage.load();
  useGpsSessionsStore.setState({
    hydrated: true,
    sessions: value.slice(-MAX_GPS_SESSIONS),
    storageFailure: failure,
  });
};

export const hydrateGpsSessions = (): Promise<void> => {
  hydration ??= loadStored();
  return hydration;
};

const failureAfterWrite = (persisted: boolean): StorageFailure | null => {
  if (!persisted) return "write";
  const current = useGpsSessionsStore.getState().storageFailure;
  return current === "write" ? null : current;
};

const commit = async (sessions: StoredGpsSession[]): Promise<void> => {
  useGpsSessionsStore.setState({ sessions });
  const persisted = await activeStorage.save(sessions);
  useGpsSessionsStore.setState({
    storageFailure: failureAfterWrite(persisted),
  });
};

export const saveGpsSession = async (
  session: StoredGpsSession,
): Promise<void> => {
  await hydrateGpsSessions();
  const { sessions } = useGpsSessionsStore.getState();
  await commit([...sessions, session].slice(-MAX_GPS_SESSIONS));
};

export const renameGpsSession = (key: string, label: string): Promise<void> =>
  commit(relabel(useGpsSessionsStore.getState().sessions, key, label));

export const deleteGpsSession = (key: string): Promise<void> =>
  commit(withoutSession(useGpsSessionsStore.getState().sessions, key));

export const acknowledgeGpsStorageFailure = (): void => {
  useGpsSessionsStore.setState({ storageFailure: null });
};
