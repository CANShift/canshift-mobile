import { isWarningTripped, sensorDefaultDangerThreshold } from "@canshift/core";
import { signalKeyToSensorKind } from "../theme/signal-colors";
import { type SignalKey } from "../constants/ble";
import type { TelemetryPayload } from "../stores/signals.store";

export const CRITICAL_SIGNALS: readonly SignalKey[] = ["op", "ct", "ot"];

export interface CriticalAlert {
  key: SignalKey;
  value: number;
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
