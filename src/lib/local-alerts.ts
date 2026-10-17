import {
  isOutsideDangerBand,
  sensorDefaultDangerBand,
  type AlertLimit,
  type BuiltInAlertSource,
  type SensorDangerBand,
} from "@canshift/core";
import type { SignalKey } from "../constants/ble";
import type { TelemetryPayload } from "../stores/signals.store";
import { signalKeyToSensorKind } from "../theme/signal-colors";
import { fromSensorKindValue, toSensorKindValue } from "../theme/sensor-units";
import {
  ALERT_SOURCE_META,
  SOURCE_BY_SIGNAL,
  builtInOrigin,
  type AlertEntry,
  type AlertKey,
} from "./alert-model";

const MS_PER_SECOND = 1000;

type Side = keyof SensorDangerBand;

const SIDES: readonly Side[] = ["below", "above"];

const NO_BAND: SensorDangerBand = { below: null, above: null };

export type Onsets = Partial<Record<AlertKey, number>>;

const crossedLimit = (key: SignalKey, value: number): AlertLimit | null => {
  const kind = signalKeyToSensorKind(key);
  if (kind === undefined) return null;
  const band = sensorDefaultDangerBand(kind);
  const reading = toSensorKindValue(key, value);
  const side = SIDES.find((candidate) => {
    const limit = band[candidate];
    return (
      limit !== null &&
      isOutsideDangerBand(reading, { ...NO_BAND, [candidate]: limit })
    );
  });
  const limit = side === undefined ? null : band[side];
  if (side === undefined || limit === null) return null;
  return { value: fromSensorKindValue(key, limit), direction: side };
};

const entryFor = (
  source: BuiltInAlertSource,
  value: number,
  limit: AlertLimit,
  activeSeconds: number,
): AlertEntry => {
  const meta = ALERT_SOURCE_META[source];
  return {
    key: source,
    origin: builtInOrigin(source),
    name: meta.name,
    unit: meta.unit,
    decimals: meta.decimals,
    value,
    limit,
    dashAcknowledged: false,
    activeSeconds,
  };
};

export const localAlerts = (
  values: TelemetryPayload,
  onsets: Onsets,
  nowMs: number,
): AlertEntry[] =>
  (Object.keys(SOURCE_BY_SIGNAL) as SignalKey[]).flatMap((key) => {
    const source = SOURCE_BY_SIGNAL[key];
    const value = values[key];
    if (source === undefined || value === undefined) return [];
    const limit = crossedLimit(key, value);
    if (limit === null) return [];
    const since = onsets[source] ?? nowMs;
    return [
      entryFor(
        source,
        value,
        limit,
        Math.floor((nowMs - since) / MS_PER_SECOND),
      ),
    ];
  });

export const nextOnsets = (
  previous: Onsets,
  entries: readonly AlertEntry[],
  nowMs: number,
): Onsets =>
  Object.fromEntries(
    entries.map((entry) => [entry.key, previous[entry.key] ?? nowMs]),
  );
