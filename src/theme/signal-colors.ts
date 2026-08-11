import type { SensorKind } from "@canshift/core";
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
