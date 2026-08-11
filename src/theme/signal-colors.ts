import {
  SENSOR_DEFAULT_RAMPS,
  colorAtValue,
  type SensorKind,
} from "@canshift/core";
import type { SignalKey } from "../constants/ble";

export const KEY_TO_SENSOR_KIND: Record<string, SensorKind> = {
  r: "rpm",
  ct: "coolant_temp",
  ot: "oil_temp",
  op: "oil_press",
  iat: "intake_temp",
  bst: "boost",
  lam: "afr",
} satisfies Partial<Record<SignalKey, SensorKind>>;

export const signalKeyToSensorKind = (key: string): SensorKind | undefined =>
  KEY_TO_SENSOR_KIND[key];

const STOICH_GASOLINE_AFR = 14.7;

const rampValueForKey = (key: string, value: number): number =>
  key === "lam" ? value * STOICH_GASOLINE_AFR : value;

export const signalRampColor = (key: string, value: number): string | null => {
  const kind = KEY_TO_SENSOR_KIND[key];
  if (kind === undefined) return null;
  return colorAtValue(SENSOR_DEFAULT_RAMPS[kind], rampValueForKey(key, value));
};
