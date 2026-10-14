import { sensorDefaultRange } from "@canshift/core";
import { SIGNAL_META, type SignalKey } from "../constants/ble";
import { signalKeyToSensorKind } from "../theme/signal-colors";
import { isSignalInDanger } from "./signal-danger";
import {
  formatWidgetValue,
  gearGlyphFor,
  heldPlaceholder,
} from "../components/widgets/widget-value";

export type DashTone = "normal" | "danger" | "stale";

export interface DashReading {
  text: string;
  tone: DashTone;
  barFraction: number;
}

interface BarRange {
  min: number;
  max: number;
}

const PERCENT_RANGE: BarRange = { min: 0, max: 100 };

const PERCENT_SIGNALS: ReadonlySet<SignalKey> = new Set(["tps"]);

export const barRangeFor = (signal: SignalKey): BarRange | null => {
  if (PERCENT_SIGNALS.has(signal)) return PERCENT_RANGE;
  const kind = signalKeyToSensorKind(signal);
  return kind === undefined ? null : sensorDefaultRange(kind);
};

const barFractionOf = (signal: SignalKey, value: number): number => {
  const range = barRangeFor(signal);
  if (range === null || range.max <= range.min) return 0;
  const fraction = (value - range.min) / (range.max - range.min);
  return Math.min(1, Math.max(0, fraction));
};

const liveText = (signal: SignalKey, value: number): string =>
  signal === "g"
    ? gearGlyphFor(value)
    : formatWidgetValue(value, SIGNAL_META[signal].decimals);

export const dashReading = (
  signal: SignalKey,
  value: number | undefined,
  isLive: boolean,
): DashReading => {
  if (!isLive || value === undefined) {
    return {
      text: heldPlaceholder(value, SIGNAL_META[signal].decimals),
      tone: "stale",
      barFraction: 0,
    };
  }
  return {
    text: liveText(signal, value),
    tone: isSignalInDanger(signal, value) ? "danger" : "normal",
    barFraction: barFractionOf(signal, value),
  };
};
