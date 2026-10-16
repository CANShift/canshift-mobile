import { isOutsideDangerBand, sensorDefaultDangerBand } from "@canshift/core";
import type { SensorDangerBand } from "@canshift/core";
import { isSignalInDanger } from "./signal-danger";
import { signalKeyToSensorKind } from "../theme/signal-colors";
import { fromSensorKindValue, toSensorKindValue } from "../theme/sensor-units";
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
  skipped: ReadonlySet<SignalKey>,
): CriticalAlert | null => {
  for (const key of CRITICAL_SIGNALS) {
    if (skipped.has(key)) continue;
    const value = values[key];
    if (value === undefined) continue;
    if (isSignalInDanger(key, value)) return { key, value };
  }
  return null;
};

export const trippedCriticalKeys = (values: TelemetryPayload): SignalKey[] =>
  CRITICAL_SIGNALS.filter((key) => {
    const value = values[key];
    return value !== undefined && isSignalInDanger(key, value);
  });

export const retainAcknowledged = (
  acknowledged: readonly SignalKey[],
  tripped: readonly SignalKey[],
): readonly SignalKey[] => {
  const kept = acknowledged.filter((key) => tripped.includes(key));
  return kept.length === acknowledged.length ? acknowledged : kept;
};

const withUnit = (key: SignalKey, text: string): string => {
  const { unit } = SIGNAL_META[key];
  return unit === "" ? text : `${text} ${unit}`;
};

export const criticalAlertName = (key: SignalKey): string =>
  SIGNAL_META[key].label.toUpperCase();

export const criticalAlertValue = (alert: CriticalAlert): string =>
  formatWidgetValue(alert.value, SIGNAL_META[alert.key].decimals);

type DangerSide = keyof SensorDangerBand;

interface DangerLimit {
  side: DangerSide;
  limit: number;
}

const DANGER_SIDES: readonly DangerSide[] = ["below", "above"];

const DANGER_SIDE_LABELS: Record<DangerSide, string> = {
  below: "MIN",
  above: "MAX",
};

const NO_DANGER_BAND: SensorDangerBand = { below: null, above: null };

const dangerLimits = (band: SensorDangerBand): DangerLimit[] =>
  DANGER_SIDES.flatMap((side) => {
    const limit = band[side];
    return limit === null ? [] : [{ side, limit }];
  });

const isLimitCrossed = (value: number, { side, limit }: DangerLimit): boolean =>
  isOutsideDangerBand(value, { ...NO_DANGER_BAND, [side]: limit });

const limitsToShow = (band: SensorDangerBand, value: number): DangerLimit[] => {
  const limits = dangerLimits(band);
  const crossed = limits.filter((limit) => isLimitCrossed(value, limit));
  return crossed.length > 0 ? crossed : limits;
};

const limitText = (key: SignalKey, { side, limit }: DangerLimit): string => {
  const value = formatWidgetValue(
    fromSensorKindValue(key, limit),
    SIGNAL_META[key].decimals,
  );
  return withUnit(key, `${DANGER_SIDE_LABELS[side]} ${value}`);
};

export const criticalAlertThreshold = (alert: CriticalAlert): string => {
  const kind = signalKeyToSensorKind(alert.key);
  if (kind === undefined) return "OUT OF THE SAFE RANGE";
  const band = sensorDefaultDangerBand(kind);
  const value = toSensorKindValue(alert.key, alert.value);
  return limitsToShow(band, value)
    .map((limit) => limitText(alert.key, limit))
    .join(" · ");
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
