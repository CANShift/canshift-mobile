import { isWarningTripped, sensorDefaultDangerThreshold } from "@canshift/core";
import type { SignalKey } from "../constants/ble";
import { signalKeyToSensorKind } from "../theme/signal-colors";
import { toSensorKindValue } from "../theme/sensor-units";

export const isSignalInDanger = (signal: SignalKey, value: number): boolean => {
  const kind = signalKeyToSensorKind(signal);
  if (kind === undefined) return false;
  const danger = sensorDefaultDangerThreshold(kind);
  return isWarningTripped(
    toSensorKindValue(signal, value),
    danger.threshold,
    danger.invertLogic,
  );
};
