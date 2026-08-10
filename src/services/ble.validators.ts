import { decodeTelemetryFrame } from "@canshift/core";

import { type SignalKey } from "../constants/ble";
import { tryParseJson } from "../lib/try-parse-json";

export type TelemetrySample = Partial<Record<SignalKey, number>>;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const parseTelemetry = (bytes: Uint8Array): TelemetrySample | null => {
  return decodeTelemetryFrame(bytes);
};

export interface DeviceScreenSettings {
  brightness: number;
  sleep: number;
}

export const parseDeviceSettings = (
  raw: string,
): DeviceScreenSettings | null => {
  const parsed = tryParseJson(raw);
  if (!parsed.ok || !isPlainObject(parsed.value)) return null;
  const { brightness, sleep } = parsed.value;
  if (typeof brightness !== "number" || !Number.isFinite(brightness))
    return null;
  if (typeof sleep !== "number" || !Number.isFinite(sleep)) return null;
  return { brightness, sleep };
};
