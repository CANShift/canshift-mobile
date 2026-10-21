import { STRINGS } from "../strings";
import { CIRCUIT_STRINGS } from "../circuit-strings";
import type { SavedCircuit } from "../services/circuit-storage";
import type { GpsFix } from "./gps-fix";

type FixedStep = "denied" | "waiting" | "placeLine" | "ready";

type GpsSetupAction = "openSettings" | "setLine" | "reuseCircuit" | "start";

export interface GpsSetupView {
  label: string;
  action: GpsSetupAction;
  enabled: boolean;
  hint: string | null;
  showsLine: boolean;
}

export const GPS_SETUP_VIEWS: Record<FixedStep, GpsSetupView> = {
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

const reuseCircuitView = (circuit: SavedCircuit): GpsSetupView => ({
  label: CIRCUIT_STRINGS.use(circuit.name),
  action: "reuseCircuit",
  enabled: true,
  hint: CIRCUIT_STRINGS.useHint,
  showsLine: true,
});

const FIX_STEP: Record<GpsFix, FixedStep | null> = {
  denied: "denied",
  searching: "waiting",
  weak: "waiting",
  ready: null,
};

export const gpsSetupView = (
  fix: GpsFix,
  lineSet: boolean,
  near: SavedCircuit | null,
): GpsSetupView => {
  const fixStep = FIX_STEP[fix];
  if (fixStep !== null) return GPS_SETUP_VIEWS[fixStep];
  if (lineSet) return GPS_SETUP_VIEWS.ready;
  return near === null ? GPS_SETUP_VIEWS.placeLine : reuseCircuitView(near);
};
