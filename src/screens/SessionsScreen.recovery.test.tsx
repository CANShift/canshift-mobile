import * as React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import SessionsScreen from "./SessionsScreen";
import { HISTORY_STRINGS } from "../history-strings";
import {
  hydrateGpsSessions,
  saveGpsSession,
  setGpsSessionStorage,
  useGpsSessionsStore,
} from "../stores/gps-sessions.store";
import {
  clearTimerSessions,
  hydrateTimerSessions,
  recordSessionLap,
  setTimerSessionStorage,
  useTimerSessionsStore,
} from "../stores/timer-sessions.store";
import {
  fileGpsSessionStorage,
  type StoredGpsSession,
} from "../services/gps-session-storage";
import { fileTimerSessionStorage } from "../services/timer-session-storage";
import {
  memoryFileFaults,
  memoryFiles,
  resetMemoryFileSystem,
} from "../testing/memory-file-system";

jest.mock("expo-file-system", () =>
  jest.requireActual<typeof import("../testing/memory-file-system")>(
    "../testing/memory-file-system",
  ),
);

const GPS_FILE = "canshift-gps-sessions.json";
const TIMER_FILE = "canshift-timer-sessions.json";
const CORRUPT = "{";

const GPS: StoredGpsSession = {
  key: "g-2000",
  startedAt: 2_000,
  label: "Magny-Cours",
  laps: [],
  maxSpeedMs: 0,
  trace: [],
};

const initialGps = useGpsSessionsStore.getState();
const initialTimer = useTimerSessionsStore.getState();

const launch = (): void => {
  useGpsSessionsStore.setState(initialGps, true);
  useTimerSessionsStore.setState(initialTimer, true);
  setGpsSessionStorage(fileGpsSessionStorage);
  setTimerSessionStorage(fileTimerSessionStorage);
};

const setAsideCopies = (fileName: string): (string | undefined)[] => {
  const prefix = `${fileName.replace(/\.json$/, "")}.unreadable-`;
  return [...memoryFiles.keys()]
    .filter((name) => name.startsWith(prefix))
    .map((name) => memoryFiles.get(name));
};

const flush = () => new Promise((resolve) => setImmediate(resolve));

const renderSessions = async () => {
  const view = await render(
    <SessionsScreen onBack={jest.fn()} onOpen={jest.fn()} />,
  );
  await act(() => Promise.resolve());
  return view;
};

const recordLap = (): void => {
  recordSessionLap({ sessionId: 1, index: 1, lapMs: 900, totalMs: 900 });
};

describe("Sessions screen with an unreadable sessions file", () => {
  beforeEach(() => {
    resetMemoryFileSystem();
    launch();
  });

  it("sets a corrupt GPS file aside and saves the next session", async () => {
    memoryFiles.set(GPS_FILE, CORRUPT);
    const view = await renderSessions();
    expect(view.getByText(HISTORY_STRINGS.readFailedSetAside)).toBeTruthy();
    expect(setAsideCopies(GPS_FILE)).toEqual([CORRUPT]);

    await act(() => saveGpsSession(GPS));

    launch();
    await hydrateGpsSessions();
    expect(useGpsSessionsStore.getState().sessions).toEqual([GPS]);
    expect(useGpsSessionsStore.getState().storageFailure).toBeNull();
  });

  it("sets a corrupt timer file aside and saves the next laps", async () => {
    memoryFiles.set(TIMER_FILE, CORRUPT);
    const view = await renderSessions();
    expect(view.getByText(HISTORY_STRINGS.readFailedSetAside)).toBeTruthy();
    expect(setAsideCopies(TIMER_FILE)).toEqual([CORRUPT]);

    await act(async () => {
      recordLap();
      await flush();
    });

    launch();
    await hydrateTimerSessions();
    expect(useTimerSessionsStore.getState().sessions).toHaveLength(1);
    expect(useTimerSessionsStore.getState().readFailure).toBeNull();
  });

  it("keeps the failure on screen when the file can't be set aside", async () => {
    memoryFiles.set(GPS_FILE, CORRUPT);
    memoryFileFaults.moves = true;
    const view = await renderSessions();
    expect(view.getByText(HISTORY_STRINGS.readFailedKept)).toBeTruthy();

    await act(() => {
      void fireEvent.press(view.getByText(HISTORY_STRINGS.readFailedKept));
    });
    await act(() => saveGpsSession(GPS));

    expect(view.getByText(HISTORY_STRINGS.writeFailed)).toBeTruthy();
    expect(memoryFiles.get(GPS_FILE)).toBe(CORRUPT);
  });

  it("reads the timer file before a clear writes over it", async () => {
    memoryFiles.set(TIMER_FILE, CORRUPT);

    await clearTimerSessions();
    await flush();

    expect(setAsideCopies(TIMER_FILE)).toEqual([CORRUPT]);
    expect(memoryFiles.get(TIMER_FILE)).toBe("[]");
    expect(useTimerSessionsStore.getState().readFailure).toBe("set-aside");
  });

  it("leaves an unreadable timer file alone when a clear can't set it aside", async () => {
    memoryFiles.set(TIMER_FILE, CORRUPT);
    memoryFileFaults.moves = true;

    await clearTimerSessions();
    await flush();

    expect(memoryFiles.get(TIMER_FILE)).toBe(CORRUPT);
    expect(useTimerSessionsStore.getState().readFailure).toBe("kept");
  });
});
