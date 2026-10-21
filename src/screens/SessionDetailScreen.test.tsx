import * as React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import SessionDetailScreen from "./SessionDetailScreen";
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
import { Toast } from "../components/ui/toast";

const mockShare = jest.fn((_name: string, _content: string) =>
  Promise.resolve(),
);

jest.mock("../services/share-file", () => ({
  shareTextFile: (name: string, content: string) => mockShare(name, content),
}));

const GPS: StoredGpsSession = {
  key: "g-2000",
  startedAt: Date.UTC(2026, 9, 21, 14, 32),
  label: "",
  laps: [
    { number: 1, startMs: 0, endMs: 95_000, durationMs: 95_000 },
    { number: 2, startMs: 95_000, endMs: 187_450, durationMs: 92_450 },
  ],
  maxSpeedMs: 50,
  trace: [{ t: 0, lat: 47, lng: 4, speedMs: 10 }],
};

let stored: readonly StoredGpsSession[] = [];

const renderDetail = async (onBack = jest.fn()) => {
  const view = await render(
    <SessionDetailScreen sessionKey="g-2000" onBack={onBack} />,
  );
  await act(() => Promise.resolve());
  return view;
};

type View = Awaited<ReturnType<typeof renderDetail>>;

const press = async (view: View, label: string) => {
  await act(() => {
    void fireEvent.press(view.getByLabelText(label));
  });
};

const initialGps = useGpsSessionsStore.getState();
const initialTimer = useTimerSessionsStore.getState();

describe("Session detail screen", () => {
  beforeEach(() => {
    stored = [GPS];
    mockShare.mockClear();
    useGpsSessionsStore.setState(initialGps, true);
    useTimerSessionsStore.setState(initialTimer, true);
    setGpsSessionStorage({
      load: () => Promise.resolve({ value: stored, failure: null }),
      save: (sessions) => {
        stored = sessions;
        return Promise.resolve(true);
      },
    });
    setTimerSessionStorage({
      load: () => Promise.resolve({ value: [], failure: null }),
      save: () => Promise.resolve(true),
    });
  });

  it("shows the session stats and its laps", async () => {
    const view = await renderDetail();
    expect(view.getByText(HISTORY_STRINGS.kmh(180))).toBeTruthy();
    expect(view.getAllByText("1:32.45").length).toBeGreaterThan(0);
    expect(view.getByText("1:33.72")).toBeTruthy();
    expect(view.getByText("Lap 1")).toBeTruthy();
  });

  it("exports the GPS trace as GPX and the laps as CSV", async () => {
    const view = await renderDetail();
    await press(view, HISTORY_STRINGS.exportGpx);
    await press(view, HISTORY_STRINGS.exportCsv);
    expect(mockShare.mock.calls.map(([name]) => name)).toEqual([
      "canshift-session-2026-10-21-14-32.gpx",
      "canshift-session-2026-10-21-14-32.csv",
    ]);
    expect(mockShare.mock.calls[0]?.[1]).toContain('<trkpt lat="47" lon="4">');
  });

  it("reports a failed export once, as a toast", async () => {
    const toast = jest.spyOn(Toast, "show").mockImplementation(jest.fn());
    mockShare.mockRejectedValueOnce(new Error("disk full"));
    const view = await renderDetail();
    await press(view, HISTORY_STRINGS.exportCsv);
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: HISTORY_STRINGS.exportFailed,
    });
    toast.mockRestore();
  });

  it("renames the session", async () => {
    const view = await renderDetail();
    await act(() => {
      void fireEvent(
        view.getByLabelText(HISTORY_STRINGS.labelField),
        "endEditing",
        {
          nativeEvent: { text: "Dijon" },
        },
      );
    });
    expect(stored[0]?.label).toBe("Dijon");
  });

  it("deletes the session after confirming, then leaves", async () => {
    const onBack = jest.fn();
    const view = await renderDetail(onBack);
    await press(view, HISTORY_STRINGS.deleteSession);
    expect(view.getByText(HISTORY_STRINGS.deleteTitle)).toBeTruthy();
    await press(view, HISTORY_STRINGS.delete);
    expect(stored).toEqual([]);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
