import type { SensorKind } from "@canshift/core";
import type { SignalKey } from "../constants/ble";

const KEY_TO_SENSOR_KIND: Record<string, SensorKind> = {
  r: "rpm",
  ct: "coolant_temp",
  ot: "oil_temp",
  op: "oil_press",
  bat: "battery_volts",
  iat: "intake_temp",
  bst: "boost",
  lam: "afr",
} satisfies Partial<Record<SignalKey, SensorKind>>;

export const signalKeyToSensorKind = (key: string): SensorKind | undefined =>
  KEY_TO_SENSOR_KIND[key];
