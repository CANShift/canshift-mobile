import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { act, fireEvent, render } from "@testing-library/react-native";
import LapsScreen from "./LapsScreen";
import { useGpsFixStore } from "../stores/gps-fix.store";
import {
  clearAll,
  pushSample,
  useTrackSessionStore,
} from "../stores/track-session.store";
import { setCircuitStorage, useCircuitsStore } from "../stores/circuits.store";
import type { SavedCircuit } from "../services/circuit-storage";
import { CIRCUIT_STRINGS } from "../circuit-strings";
import { STRINGS } from "../strings";

jest.mock("../services/gps-preview", () => ({
  gpsPreview: { start: () => Promise.resolve(), stop: () => undefined },
}));
jest.mock("../services/track-mode-controller", () => ({
  trackModeController: {
    start: () => Promise.resolve({ started: true }),
    stop: () => Promise.resolve(),
    isActive: () => false,
  },
}));
jest.mock("../stores/timer-sessions.store", () => {
  const { create } = jest.requireActual<typeof import("zustand")>("zustand");
  return {
    useTimerSessionsStore: create(() => ({ persistFailed: false })),
    acknowledgePersistFailure: jest.fn(),
    hydrateTimerSessions: () => Promise.resolve(),
  };
});

const LAT = 47.0786;
const LNG = 7.0611;

const lignieres: SavedCircuit = {
  id: "c-1",
  name: "Lignières",
  line: {
    a: { lat: LAT, lng: LNG - 0.0003 },
    b: { lat: LAT, lng: LNG + 0.0003 },
  },
  forwardBearingDeg: 0,
  savedAt: 1,
};

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderLaps = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <NavigationContainer>
        <LapsScreen />
      </NavigationContainer>
    </SafeAreaProvider>,
  );

type View = Awaited<ReturnType<typeof renderLaps>>;

const press = async (view: View, label: string) => {
  await act(() => {
    void fireEvent.press(view.getByLabelText(label));
  });
};

const lastByLabel = (view: View, label: string) => {
  const element = view.getAllByLabelText(label).at(-1);
  if (element === undefined) throw new Error(`No element labelled ${label}`);
  return element;
};

let saved: readonly SavedCircuit[] = [];

const startWith = (circuits: SavedCircuit[]): void => {
  saved = circuits;
  useCircuitsStore.setState({ hydrated: false, circuits: [], armed: null });
  setCircuitStorage({
    load: () => Promise.resolve({ value: [...saved], failed: false }),
    save: (next) => {
      saved = [...next];
      return Promise.resolve(true);
    },
  });
};

const standAt = (lat: number, lng: number): void => {
  pushSample({ t: Date.now(), lat, lng, speedMs: 0, headingDeg: 0 });
};

describe("Laps screen — saved circuits", () => {
  beforeEach(() => {
    clearAll();
    useGpsFixStore.setState({ permission: "granted", accuracyM: 3 });
  });

  it("offers the nearby circuit as the primary action and arms its line", async () => {
    startWith([lignieres]);
    standAt(LAT + 0.002, LNG);
    const view = await renderLaps();
    expect(view.getByText(CIRCUIT_STRINGS.useHint)).toBeTruthy();
    await press(view, CIRCUIT_STRINGS.use("Lignières"));
    expect(useTrackSessionStore.getState().startFinishSet).toBe(true);
    expect(view.getByText("Lignières")).toBeTruthy();
    expect(view.getByLabelText(STRINGS.laps.startTrackMode)).toBeTruthy();
  });

  it("still lets the driver place a new line near a saved circuit", async () => {
    startWith([lignieres]);
    standAt(LAT, LNG);
    const view = await renderLaps();
    await press(view, CIRCUIT_STRINGS.setHere);
    expect(view.getByText(STRINGS.laps.lineSet)).toBeTruthy();
    expect(view.getByLabelText(CIRCUIT_STRINGS.save)).toBeTruthy();
  });

  it("asks to set a line when no saved circuit is close", async () => {
    startWith([lignieres]);
    standAt(LAT + 0.1, LNG);
    const view = await renderLaps();
    expect(view.getByLabelText(STRINGS.laps.setLineHere)).toBeTruthy();
    expect(view.getByLabelText(CIRCUIT_STRINGS.manage)).toBeTruthy();
  });

  it("saves the placed line under the name typed", async () => {
    startWith([]);
    standAt(LAT, LNG);
    const view = await renderLaps();
    await press(view, STRINGS.laps.setLineHere);
    await press(view, CIRCUIT_STRINGS.save);
    await act(() => {
      void fireEvent.changeText(
        view.getByLabelText(CIRCUIT_STRINGS.nameLabel),
        "Home",
      );
    });
    await act(() => {
      void fireEvent.press(lastByLabel(view, CIRCUIT_STRINGS.save));
    });
    expect(saved.map((circuit) => circuit.name)).toEqual(["Home"]);
    expect(view.getByText("Home")).toBeTruthy();
  });

  it("renames and deletes from the circuits sheet", async () => {
    startWith([lignieres]);
    standAt(LAT + 0.1, LNG);
    const view = await renderLaps();
    await press(view, CIRCUIT_STRINGS.manage);
    await press(view, CIRCUIT_STRINGS.rename);
    await act(() => {
      void fireEvent.changeText(
        view.getByLabelText(CIRCUIT_STRINGS.nameLabel),
        "Short",
      );
    });
    await press(view, CIRCUIT_STRINGS.save);
    expect(saved[0]?.name).toBe("Short");
    await press(view, CIRCUIT_STRINGS.delete);
    expect(view.getByText(CIRCUIT_STRINGS.deleteTitle("Short"))).toBeTruthy();
    await act(() => {
      void fireEvent.press(lastByLabel(view, CIRCUIT_STRINGS.delete));
    });
    expect(saved).toEqual([]);
    expect(view.getByText(CIRCUIT_STRINGS.empty)).toBeTruthy();
  });
});
