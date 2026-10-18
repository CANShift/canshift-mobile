import { startFinishLineFromPosition } from "@canshift/core";
import {
  trackModeController,
  type TrackModeStartFailure,
  type TrackModeStartResult,
} from "../services/track-mode-controller";
import { Toast } from "../components/ui/toast";
import {
  armStartFinishLine,
  clearStartFinishLine,
  getLatestSample,
} from "../stores/track-session.store";
import { STRINGS } from "../strings";
import { reportFailure } from "./report-dash-failure";

type StartFailure = Exclude<TrackModeStartFailure, "cancelled">;

const START_FAILURE_COPY: Record<StartFailure, string> = {
  permission_denied: STRINGS.laps.locationOffTitle,
  gps_unavailable: STRINGS.laps.gpsUnavailable,
  session_failed: STRINGS.laps.startFailed,
};

const announceStart = (result: TrackModeStartResult): void => {
  if (result.started || result.reason === "cancelled") return;
  Toast.show({ type: "error", text1: START_FAILURE_COPY[result.reason] });
};

export const startTrackMode = async (): Promise<void> => {
  try {
    announceStart(await trackModeController.start());
  } catch (err) {
    reportFailure("Track mode start", err, STRINGS.laps.startFailed);
  }
};

export const stopTrackMode = async (): Promise<void> => {
  try {
    await trackModeController.stop();
  } catch (err) {
    reportFailure("Track mode stop", err, STRINGS.genericError);
  }
};

export const setLineHere = (): boolean => {
  const sample = getLatestSample();
  if (sample === undefined) return false;
  const { line, forwardBearingDeg } = startFinishLineFromPosition(sample);
  armStartFinishLine(line, { forwardBearingDeg });
  return true;
};

export const resetLine = (): void => {
  clearStartFinishLine();
};
