import * as React from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { act, fireEvent, render } from "@testing-library/react-native";
import LapsScreen from "./LapsScreen";
import { useGpsFixStore } from "../stores/gps-fix.store";
import {
  clearAll,
  recordLap,
  useTrackSessionStore,
} from "../stores/track-session.store";
import { useTimerStore } from "../stores/timer.store";
import { useTimerSessionsStore } from "../stores/timer-sessions.store";
import { STRINGS } from "../strings";

const mockStart = jest.fn(() => Promise.resolve({ started: true as const }));
const mockStop = jest.fn(() => Promise.resolve());
const mockReset = jest.fn();

jest.mock("../services/gps-preview", () => ({
  gpsPreview: { start: () => Promise.resolve(), stop: () => undefined },
}));
jest.mock("../services/track-mode-controller", () => ({
  trackModeController: {
    start: () => mockStart(),
    stop: () => mockStop(),
    isActive: () => false,
  },
}));
jest.mock("../services/timer-control", () => ({
  timerControl: {
    start: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    lap: jest.fn(),
    reset: () => {
      mockReset();
    },
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

const isDisabled = (view: View, label: string): boolean =>
  (
    view.getByLabelText(label).props as {
      accessibilityState?: { disabled?: boolean };
    }
  ).accessibilityState?.disabled === true;

const initialTimer = useTimerStore.getState();

describe("Laps screen — GPS timing", () => {
  beforeEach(() => {
    clearAll();
    mockStart.mockClear();
    useGpsFixStore.setState({ permission: "granted", accuracyM: null });
  });

  it("waits for a fix and keeps Start disabled with the reason", async () => {
    useGpsFixStore.setState({ accuracyM: 18 });
    const view = await renderLaps();
    expect(view.getByText(STRINGS.laps.waitingForGps)).toBeTruthy();
    expect(view.getByText(STRINGS.laps.accuracy(18, 5))).toBeTruthy();
    expect(isDisabled(view, STRINGS.laps.startTrackMode)).toBe(true);
    expect(view.getByText(STRINGS.laps.needsFixAndLine)).toBeTruthy();
  });

  it("starts track mode once the fix is good and the line is set", async () => {
    useGpsFixStore.setState({ accuracyM: 3 });
    useTrackSessionStore.setState({ startFinishSet: true });
    const view = await renderLaps();
    expect(view.getByText(STRINGS.laps.gpsReady)).toBeTruthy();
    expect(view.getByText(STRINGS.laps.lineSet)).toBeTruthy();
    await press(view, STRINGS.laps.startTrackMode);
    expect(mockStart).toHaveBeenCalled();
  });

  it("offers Open Settings when location is refused", async () => {
    useGpsFixStore.setState({ permission: "denied" });
    const view = await renderLaps();
    expect(view.getByText(STRINGS.laps.locationOffTitle)).toBeTruthy();
    expect(view.getByLabelText(STRINGS.laps.openSettings)).toBeTruthy();
  });

  it("shows the running lap, the best lap and asks before stopping", async () => {
    useTrackSessionStore.setState({
      recording: true,
      sessionStartMs: Date.now(),
    });
    recordLap(0, 74_070);
    recordLap(74_070, 145_970);
    const view = await renderLaps();
    expect(view.getByText(STRINGS.laps.trackModeTag)).toBeTruthy();
    expect(view.getAllByText("Lap 3").length).toBeGreaterThan(0);
    expect(view.getByText(STRINGS.laps.bestTag)).toBeTruthy();
    expect(view.getByText("+2.17")).toBeTruthy();
    await press(view, STRINGS.laps.stopTrackMode);
    expect(view.getByText(STRINGS.laps.stopTrackModeTitle)).toBeTruthy();
    await press(view, STRINGS.laps.stop);
    expect(mockStop).toHaveBeenCalled();
  });
});

describe("Laps screen — Dash timer", () => {
  beforeEach(() => {
    useTimerStore.setState(initialTimer, true);
    mockReset.mockClear();
  });

  const openTimer = async (): Promise<View> => {
    const view = await renderLaps();
    await press(view, STRINGS.laps.dashTimer);
    return view;
  };

  it("is ready, phone only and explains why", async () => {
    const view = await openTimer();
    expect(view.getByText(STRINGS.laps.ready)).toBeTruthy();
    expect(view.getByText(STRINGS.laps.phoneOnly)).toBeTruthy();
    expect(view.getByText(STRINGS.laps.phoneOnlyBody)).toBeTruthy();
  });

  it("gives Capture lap a glove-sized target while running", async () => {
    useTimerStore.setState({
      status: "running",
      startedAt: Date.now(),
      deviceSynced: true,
    });
    const view = await openTimer();
    expect(view.getByText(STRINGS.laps.synced)).toBeTruthy();
    const capture = view.getByLabelText(STRINGS.laps.captureLap);
    const style = StyleSheet.flatten(
      capture.props.style as StyleProp<ViewStyle>,
    );
    expect(style?.height).toBeGreaterThanOrEqual(88);
  });

  it("asks before resetting a paused timer", async () => {
    useTimerStore.setState({ status: "paused", accumulatedMs: 52_100 });
    const view = await openTimer();
    expect(view.getByLabelText(STRINGS.laps.resume)).toBeTruthy();
    await press(view, STRINGS.laps.resetEllipsis);
    expect(view.getByText(STRINGS.laps.resetTitle)).toBeTruthy();
    await press(view, STRINGS.laps.reset);
    expect(mockReset).toHaveBeenCalled();
  });

  it("warns when laps can't be saved", async () => {
    useTimerSessionsStore.setState({ persistFailed: true });
    const view = await openTimer();
    expect(view.getByText(STRINGS.laps.cantSave)).toBeTruthy();
  });
});
