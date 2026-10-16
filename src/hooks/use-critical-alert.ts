import { useEffect, useMemo } from "react";
import { useSignalsStore, useSignalsIsLive } from "../stores/signals.store";
import { useCriticalAlertStore } from "../stores/critical-alert.store";
import {
  selectCriticalAlert,
  trippedCriticalKeys,
  criticalAlertName,
  criticalAlertRows,
  criticalAlertThreshold,
  criticalAlertValue,
  type CriticalAlert,
  type CriticalAlertRow,
} from "../lib/critical-alert";
import { useSecondsSince } from "./use-seconds-since";
import type { SignalKey } from "../constants/ble";

export interface ActiveCriticalAlert {
  key: SignalKey;
  name: string;
  value: string;
  threshold: string;
  rows: CriticalAlertRow[];
}

const useSkippedKeys = (includeAcknowledged: boolean): Set<SignalKey> => {
  const mutedKeys = useCriticalAlertStore((s) => s.mutedKeys);
  const acknowledgedKeys = useCriticalAlertStore((s) => s.acknowledgedKeys);
  return useMemo(
    () =>
      new Set(
        includeAcknowledged ? [...mutedKeys, ...acknowledgedKeys] : mutedKeys,
      ),
    [includeAcknowledged, mutedKeys, acknowledgedKeys],
  );
};

const useLiveAlert = (includeAcknowledged: boolean): CriticalAlert | null => {
  const values = useSignalsStore((s) => s.values);
  const isLive = useSignalsIsLive();
  const skipped = useSkippedKeys(includeAcknowledged);
  if (!isLive) return null;
  return selectCriticalAlert(values, skipped);
};

const useForgetRecoveredAcknowledgements = (): void => {
  const values = useSignalsStore((s) => s.values);
  const isLive = useSignalsIsLive();
  const retainTripped = useCriticalAlertStore((s) => s.retainTripped);

  useEffect(() => {
    retainTripped(isLive ? trippedCriticalKeys(values) : []);
  }, [values, isLive, retainTripped]);
};

const useHoldingAlert = (): CriticalAlert | null => {
  useForgetRecoveredAcknowledgements();
  return useLiveAlert(true);
};

export const useCriticalAlertKey = (): SignalKey | null =>
  useLiveAlert(false)?.key ?? null;

export const useCriticalAlertHolds = (): boolean => useHoldingAlert() !== null;

export const useCriticalAlert = (): ActiveCriticalAlert | null => {
  const holding = useHoldingAlert();
  const values = useSignalsStore((s) => s.values);
  const sinceSeconds = useSecondsSince(holding?.key ?? null);
  if (holding === null) return null;
  return {
    key: holding.key,
    name: criticalAlertName(holding.key),
    value: criticalAlertValue(holding),
    threshold: criticalAlertThreshold(holding),
    rows: criticalAlertRows(values, sinceSeconds),
  };
};
