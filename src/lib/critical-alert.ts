import { isWarningTripped, sensorDefaultDangerThreshold } from "@canshift/core";
import { signalKeyToSensorKind } from "../theme/signal-colors";
import { fromSensorKindValue } from "../theme/sensor-units";
import { SIGNAL_META, type SignalKey } from "../constants/ble";
import type { TelemetryPayload } from "../stores/signals.store";
import { formatWidgetValue } from "../components/widgets/widget-value";

export const CRITICAL_SIGNALS: readonly SignalKey[] = ["op", "ct", "ot"];

export const MISSING_VALUE = "- -";

export interface CriticalAlert {
  key: SignalKey;
  value: number;
}

export interface CriticalAlertRow {
  label: string;
  value: string;
}

export const selectCriticalAlert = (
  values: TelemetryPayload,
  muted: ReadonlySet<SignalKey>,
): CriticalAlert | null => {
  for (const key of CRITICAL_SIGNALS) {
    if (muted.has(key)) continue;
    const value = values[key];
    if (value === undefined) continue;
    const kind = signalKeyToSensorKind(key);
    if (kind === undefined) continue;
    const danger = sensorDefaultDangerThreshold(kind);
    if (isWarningTripped(value, danger.threshold, danger.invertLogic)) {
      return { key, value };
    }
  }
  return null;
};

const withUnit = (key: SignalKey, text: string): string => {
  const { unit } = SIGNAL_META[key];
  return unit === "" ? text : `${text} ${unit}`;
};

export const criticalAlertName = (key: SignalKey): string =>
  SIGNAL_META[key].label.toUpperCase();

export const criticalAlertValue = (alert: CriticalAlert): string =>
  formatWidgetValue(alert.value, SIGNAL_META[alert.key].decimals);

export const criticalAlertThreshold = (key: SignalKey): string => {
  const kind = signalKeyToSensorKind(key);
  if (kind === undefined) return "OUT OF THE SAFE RANGE";
  const danger = sensorDefaultDangerThreshold(kind);
  const limit = danger.invertLogic ? "MIN" : "MAX";
  const value = formatWidgetValue(
    fromSensorKindValue(key, danger.threshold),
    SIGNAL_META[key].decimals,
  );
  return withUnit(key, `${limit} ${value}`);
};

const signalText = (key: SignalKey, value: number | undefined): string =>
  value === undefined
    ? MISSING_VALUE
    : withUnit(key, formatWidgetValue(value, SIGNAL_META[key].decimals));

export const criticalAlertRows = (
  values: TelemetryPayload,
  sinceSeconds: number,
): CriticalAlertRow[] => [
  { label: "RPM", value: signalText("r", values.r) },
  { label: "OIL TEMP", value: signalText("ot", values.ot) },
  { label: "SINCE", value: `${String(sinceSeconds)} s` },
];
