import { TELEMETRY_STALE_MS } from "@canshift/core/wire";
import type { SignalKey } from "../constants/ble";
import type { SignalStamps, TelemetryPayload } from "../stores/signals.store";

const MS_PER_SECOND = 1000;

export const SIGNAL_STALE_MS = TELEMETRY_STALE_MS;

export const isSignalFresh = (
  lastAt: number | undefined,
  nowMs: number,
): boolean => lastAt !== undefined && nowMs - lastAt <= SIGNAL_STALE_MS;

export const ageSeconds = (sinceMs: number, nowMs: number): number =>
  Math.max(0, Math.floor((nowMs - sinceMs) / MS_PER_SECOND));

export const freshValues = (
  values: TelemetryPayload,
  lastAt: SignalStamps,
  nowMs: number,
): TelemetryPayload =>
  Object.fromEntries(
    Object.entries(values).filter(([key]) =>
      isSignalFresh(lastAt[key as SignalKey], nowMs),
    ),
  );
