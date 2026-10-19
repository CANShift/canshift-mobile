import {
  isOutsideDangerBand,
  sensorDefaultDangerBand,
} from "@canshift/core/widget-metrics";
import type { SignalKey } from "../constants/ble";
import { signalKeyToSensorKind } from "../theme/signal-colors";
import { toSensorKindValue } from "../theme/sensor-units";

export const isSignalInDanger = (signal: SignalKey, value: number): boolean => {
  const kind = signalKeyToSensorKind(signal);
  if (kind === undefined) return false;
  return isOutsideDangerBand(
    toSensorKindValue(signal, value),
    sensorDefaultDangerBand(kind),
  );
};
