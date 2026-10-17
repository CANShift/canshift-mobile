import {
  BUILT_IN_ALERT_SIGNALS,
  MAXXECU_SIGNAL_UNITS,
  type ActiveAlert,
  type AlertLimit,
  type AlertOrigin,
  type BuiltInAlertSource,
} from "@canshift/core";
import { SIGNAL_META, type SignalKey } from "../constants/ble";

export type AlertFeed = "local" | "dash";

export type AlertKey = BuiltInAlertSource | `configured:${string}`;

export interface AlertEntry {
  key: AlertKey;
  origin: AlertOrigin;
  name: string;
  unit: string;
  decimals: number;
  value: number;
  limit: AlertLimit | null;
  dashAcknowledged: boolean;
  activeSeconds: number;
}

interface SourceMeta {
  name: string;
  key: SignalKey | null;
  unit: string;
  decimals: number;
}

const OWN_DECIMALS = 1;

const fromSignal = (name: string, key: SignalKey): SourceMeta => ({
  name,
  key,
  unit: SIGNAL_META[key].unit,
  decimals: SIGNAL_META[key].decimals,
});

const ofOwn = (name: string, unit: string): SourceMeta => ({
  name,
  key: null,
  unit,
  decimals: OWN_DECIMALS,
});

export const ALERT_SOURCE_META: Record<BuiltInAlertSource, SourceMeta> = {
  oil_pressure: fromSignal("Oil pressure", "op"),
  coolant_temp: fromSignal("Coolant", "ct"),
  oil_temp: fromSignal("Oil temp", "ot"),
  battery_voltage: fromSignal("Battery", "bat"),
  exhaust_temp: ofOwn("Exhaust temp", "°C"),
  gearbox_temp: ofOwn("Gearbox temp", "°C"),
  diff_temp: ofOwn("Diff temp", "°C"),
};

const BUILT_IN_BY_SIGNAL = new Map(
  (Object.keys(BUILT_IN_ALERT_SIGNALS) as BuiltInAlertSource[]).map(
    (source) => [BUILT_IN_ALERT_SIGNALS[source], ALERT_SOURCE_META[source]],
  ),
);

const configuredName = (signal: string): string =>
  signal.replace(/_/g, " ").replace(/^\w/, (first) => first.toUpperCase());

const configuredMeta = (signal: string): SourceMeta =>
  BUILT_IN_BY_SIGNAL.get(signal) ??
  ofOwn(configuredName(signal), MAXXECU_SIGNAL_UNITS[signal] ?? "");

export const builtInOrigin = (source: BuiltInAlertSource): AlertOrigin => ({
  source,
  configuredIndex: null,
});

export const alertKeyOf = (origin: AlertOrigin): AlertKey =>
  origin.source === "configured"
    ? `configured:${String(origin.configuredIndex)}`
    : origin.source;

const originOf = (alert: ActiveAlert): AlertOrigin =>
  alert.source === "configured"
    ? { source: "configured", configuredIndex: alert.configuredIndex }
    : builtInOrigin(alert.source);

const metaFor = (alert: ActiveAlert): SourceMeta =>
  alert.source === "configured"
    ? configuredMeta(alert.signal)
    : ALERT_SOURCE_META[alert.source];

export const entryFromDash = (alert: ActiveAlert): AlertEntry => {
  const meta = metaFor(alert);
  return {
    key: alertKeyOf(alert),
    origin: originOf(alert),
    name: meta.name,
    unit: meta.unit,
    decimals: meta.decimals,
    value: alert.value,
    limit: alert.limit,
    dashAcknowledged: alert.acknowledged,
    activeSeconds: alert.activeSeconds,
  };
};

export const SOURCE_BY_SIGNAL: Partial<Record<SignalKey, BuiltInAlertSource>> =
  {
    op: "oil_pressure",
    ct: "coolant_temp",
    ot: "oil_temp",
  };
