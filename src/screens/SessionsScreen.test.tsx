import * as React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import SessionsScreen from "./SessionsScreen";
import { HISTORY_STRINGS } from "../history-strings";
import {
  setGpsSessionStorage,
  useGpsSessionsStore,
} from "../stores/gps-sessions.store";
import {
  setTimerSessionStorage,
  useTimerSessionsStore,
} from "../stores/timer-sessions.store";
import type { StoredGpsSession } from "../services/gps-session-storage";
import type { StoredTimerSession } from "../services/timer-session-storage";

const GPS: StoredGpsSession = {
  key: "g-2000",
  startedAt: 2_000,
  label: "Magny-Cours",
  laps: [
    { number: 1, startMs: 2_000, endMs: 97_000, durationMs: 95_000 },
    { number: 2, startMs: 97_000, endMs: 189_450, durationMs: 92_450 },
  ],
  maxSpeedMs: 50,
  trace: [],
};

const TIMER: StoredTimerSession = {
  key: "s-1000-1",
  startedAt: 1_000,
  label: "Kart heat",
  laps: [],
};

const useStorage = (
  gps: readonly StoredGpsSession[],
  timer: StoredTimerSession[],
  readFails: { gps?: boolean; timer?: boolean } = {},
) => {
  setGpsSessionStorage({
    load: () => Promise.resolve({ value: gps, failed: readFails.gps ?? false }),
    save: () => Promise.resolve(true),
  });
  setTimerSessionStorage({
    load: () =>
      Promise.resolve({ value: timer, failed: readFails.timer ?? false }),
    save: () => Promise.resolve(true),
  });
};

const renderSessions = async (onOpen = jest.fn()) => {
  const view = await render(
    <SessionsScreen onBack={jest.fn()} onOpen={onOpen} />,
  );
  await act(() => Promise.resolve());
  return view;
};

const initialGps = useGpsSessionsStore.getState();
const initialTimer = useTimerSessionsStore.getState();

describe("Sessions screen", () => {
  beforeEach(() => {
    useGpsSessionsStore.setState(initialGps, true);
    useTimerSessionsStore.setState(initialTimer, true);
  });

  it("lists both sources newest first with their best lap", async () => {
    useStorage([GPS], [TIMER]);
    const view = await renderSessions();
    expect(view.getByText("Magny-Cours")).toBeTruthy();
    expect(view.getByText("2 laps · Best 1:32.45")).toBeTruthy();
    expect(view.getByText(HISTORY_STRINGS.sourceGps)).toBeTruthy();
    expect(view.getByText(HISTORY_STRINGS.sourceTimer)).toBeTruthy();
    expect(view.getByText(HISTORY_STRINGS.noLaps)).toBeTruthy();
  });

  it("opens a session", async () => {
    useStorage([GPS], []);
    const onOpen = jest.fn();
    const view = await renderSessions(onOpen);
    await act(() => {
      void fireEvent.press(view.getByLabelText("Magny-Cours"));
    });
    expect(onOpen).toHaveBeenCalledWith("g-2000");
  });

  it("shows the empty state", async () => {
    useStorage([], []);
    const view = await renderSessions();
    expect(view.getByText(HISTORY_STRINGS.emptyTitle)).toBeTruthy();
  });

  it.each(["gps", "timer"] as const)(
    "tells the user when the saved %s sessions couldn't be read",
    async (source) => {
      useStorage([], [], { [source]: true });
      const view = await renderSessions();
      expect(view.getByText(HISTORY_STRINGS.readFailed)).toBeTruthy();
    },
  );
});
