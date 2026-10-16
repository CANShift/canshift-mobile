import { STRINGS } from "../strings";

export type SignalStrength = "strong" | "ok" | "weak";

const STRONG_DBM = -60;
const OK_DBM = -75;

export const signalStrength = (rssi: number | null): SignalStrength => {
  if (rssi === null || rssi < OK_DBM) return "weak";
  return rssi >= STRONG_DBM ? "strong" : "ok";
};

export const SIGNAL_BARS: Record<SignalStrength, number> = {
  strong: 4,
  ok: 2,
  weak: 1,
};

export const SIGNAL_LABELS: Record<SignalStrength, string> = {
  strong: STRINGS.connect.signalStrong,
  ok: STRINGS.connect.signalOk,
  weak: STRINGS.connect.signalWeak,
};
