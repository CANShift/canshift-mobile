import { STRINGS } from "../strings";
import type { GpsFix } from "./gps-fix";

export type GpsSetupStep = "denied" | "waiting" | "placeLine" | "ready";

type GpsSetupAction = "openSettings" | "setLine" | "start";

export interface GpsSetupView {
  label: string;
  action: GpsSetupAction;
  enabled: boolean;
  hint: string | null;
  showsLine: boolean;
}

export const GPS_SETUP_VIEWS: Record<GpsSetupStep, GpsSetupView> = {
  denied: {
    label: STRINGS.laps.openSettings,
    action: "openSettings",
    enabled: true,
    hint: null,
    showsLine: false,
  },
  waiting: {
    label: STRINGS.laps.startTrackMode,
    action: "start",
    enabled: false,
    hint: null,
    showsLine: true,
  },
  placeLine: {
    label: STRINGS.laps.setLineHere,
    action: "setLine",
    enabled: true,
    hint: STRINGS.laps.setLineHint,
    showsLine: true,
  },
  ready: {
    label: STRINGS.laps.startTrackMode,
    action: "start",
    enabled: true,
    hint: null,
    showsLine: true,
  },
};

const FIX_STEP: Record<GpsFix, GpsSetupStep | null> = {
  denied: "denied",
  searching: "waiting",
  weak: "waiting",
  ready: null,
};

export const gpsSetupStep = (fix: GpsFix, lineSet: boolean): GpsSetupStep =>
  FIX_STEP[fix] ?? (lineSet ? "ready" : "placeLine");
