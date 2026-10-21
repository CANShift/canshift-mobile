import { useMemo, useState } from "react";
import { Linking } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useTrackSessionStore } from "../stores/track-session.store";
import { useGpsFixStore } from "../stores/gps-fix.store";
import { gpsFix, type GpsFix } from "../lib/gps-fix";
import { gpsSetupView, type GpsSetupView } from "../lib/gps-setup";
import type { TimedLap } from "../lib/lap-deltas";
import {
  resetLine,
  reuseCircuit,
  setLineHere,
  startTrackMode,
  stopTrackMode,
} from "../lib/track-mode-actions";
import { useCurrentLapMs } from "./use-current-lap-ms";
import { useGpsPreview } from "./use-gps-preview";
import { useCircuits, type CircuitsModel } from "./use-circuits";

export interface GpsTimingModel {
  recording: boolean;
  fix: GpsFix;
  view: GpsSetupView;
  accuracyM: number | null;
  lineSet: boolean;
  circuits: CircuitsModel;
  laps: readonly TimedLap[];
  currentLapMs: number;
  confirmingStop: boolean;
  start: () => void;
  askStop: () => void;
  cancelStop: () => void;
  confirmStop: () => void;
  setLine: () => void;
  reuseCircuit: () => void;
  resetLine: () => void;
  openSettings: () => void;
}

const useTimedLaps = (): readonly TimedLap[] => {
  const laps = useTrackSessionStore((s) => s.laps);
  return useMemo(
    () => laps.map((lap) => ({ number: lap.number, ms: lap.durationMs })),
    [laps],
  );
};

const useStopConfirmation = (): Pick<
  GpsTimingModel,
  "confirmingStop" | "askStop" | "cancelStop" | "confirmStop"
> => {
  const [confirmingStop, setConfirmingStop] = useState(false);
  return {
    confirmingStop,
    askStop: () => {
      setConfirmingStop(true);
    },
    cancelStop: () => {
      setConfirmingStop(false);
    },
    confirmStop: () => {
      setConfirmingStop(false);
      void stopTrackMode();
    },
  };
};

const useLineActions = (
  circuits: CircuitsModel,
): Pick<GpsTimingModel, "setLine" | "reuseCircuit" | "resetLine"> => ({
  setLine: () => {
    setLineHere();
  },
  reuseCircuit: () => {
    if (circuits.near !== null) reuseCircuit(circuits.near);
  },
  resetLine,
});

export const useGpsTiming = (visible: boolean): GpsTimingModel => {
  const recording = useTrackSessionStore((s) => s.recording);
  const lineSet = useTrackSessionStore((s) => s.startFinishSet);
  const permission = useGpsFixStore((s) => s.permission);
  const accuracyM = useGpsFixStore((s) => s.accuracyM);
  const stopConfirmation = useStopConfirmation();
  useGpsPreview(useIsFocused() && visible && !recording);
  const fix = gpsFix(permission, accuracyM);
  const circuits = useCircuits(fix === "ready");
  return {
    recording,
    fix,
    view: gpsSetupView(fix, lineSet, circuits.near),
    accuracyM,
    lineSet,
    circuits,
    laps: useTimedLaps(),
    currentLapMs: useCurrentLapMs(),
    ...stopConfirmation,
    ...useLineActions(circuits),
    start: () => void startTrackMode(),
    openSettings: () => void Linking.openSettings(),
  };
};
