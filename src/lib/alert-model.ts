import type { ActiveAlert, AlertLimit, AlertSource } from "@canshift/core";
import { SIGNAL_META, type SignalKey } from "../constants/ble";

export type AlertFeed = "local" | "dash";

export interface AlertEntry {
  source: AlertSource;
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
  decimals: 0,
});

export const ALERT_SOURCE_META: Record<AlertSource, SourceMeta> = {
  oil_pressure: fromSignal("Oil pressure", "op"),
  coolant_temp: fromSignal("Coolant", "ct"),
  oil_temp: fromSignal("Oil temp", "ot"),
  battery_voltage: fromSignal("Battery", "bat"),
  exhaust_temp: ofOwn("Exhaust temp", "°C"),
  gearbox_temp: ofOwn("Gearbox temp", "°C"),
  diff_temp: ofOwn("Diff temp", "°C"),
  configured: ofOwn("Alert", ""),
};

const configuredName = (signal: string): string =>
  signal.replace(/_/g, " ").replace(/^\w/, (first) => first.toUpperCase());

export const entryFromDash = (alert: ActiveAlert): AlertEntry => {
  const meta = ALERT_SOURCE_META[alert.source];
  return {
    source: alert.source,
    name:
      alert.source === "configured" ? configuredName(alert.signal) : meta.name,
    unit: meta.unit,
    decimals: meta.key === null ? 1 : meta.decimals,
    value: alert.value,
    limit: alert.limit,
    dashAcknowledged: alert.acknowledged,
    activeSeconds: alert.activeSeconds,
  };
};

export const SOURCE_BY_SIGNAL: Partial<Record<SignalKey, AlertSource>> = {
  op: "oil_pressure",
  ct: "coolant_temp",
  ot: "oil_temp",
};
