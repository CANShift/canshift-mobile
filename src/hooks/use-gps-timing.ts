import { useMemo, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useTrackSessionStore } from "../stores/track-session.store";
import { useGpsFixStore } from "../stores/gps-fix.store";
import { gpsFix, type GpsFix } from "../lib/gps-fix";
import type { TimedLap } from "../lib/lap-deltas";
import {
  resetLine,
  setLineHere,
  startTrackMode,
  stopTrackMode,
} from "../lib/track-mode-actions";
import { useCurrentLapMs } from "./use-current-lap-ms";
import { useGpsPreview } from "./use-gps-preview";

export interface GpsTimingModel {
  recording: boolean;
  fix: GpsFix;
  accuracyM: number | null;
  lineSet: boolean;
  laps: readonly TimedLap[];
  currentLapMs: number;
  confirmingStop: boolean;
  start: () => void;
  askStop: () => void;
  cancelStop: () => void;
  confirmStop: () => void;
  setLine: () => void;
  resetLine: () => void;
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

export const useGpsTiming = (visible: boolean): GpsTimingModel => {
  const recording = useTrackSessionStore((s) => s.recording);
  const lineSet = useTrackSessionStore((s) => s.startFinishSet);
  const permission = useGpsFixStore((s) => s.permission);
  const accuracyM = useGpsFixStore((s) => s.accuracyM);
  const stopConfirmation = useStopConfirmation();
  useGpsPreview(useIsFocused() && visible && !recording);
  return {
    recording,
    fix: gpsFix(permission, accuracyM),
    accuracyM,
    lineSet,
    laps: useTimedLaps(),
    currentLapMs: useCurrentLapMs(),
    ...stopConfirmation,
    start: () => void startTrackMode(),
    setLine: () => {
      setLineHere();
    },
    resetLine,
  };
};
