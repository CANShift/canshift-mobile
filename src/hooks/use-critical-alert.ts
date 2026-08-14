import { useEffect, useMemo } from "react";
import { useSignalsStore, useSignalsIsLive } from "../stores/signals.store";
import { useCriticalAlertStore } from "../stores/critical-alert.store";
import {
  selectCriticalAlert,
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

const useRaisedAlert = (): CriticalAlert | null => {
  const values = useSignalsStore((s) => s.values);
  const isLive = useSignalsIsLive();
  const mutedKeys = useCriticalAlertStore((s) => s.mutedKeys);
  const muted = useMemo(() => new Set(mutedKeys), [mutedKeys]);
  if (!isLive) return null;
  return selectCriticalAlert(values, muted);
};

const useHoldingAlert = (): CriticalAlert | null => {
  const raised = useRaisedAlert();
  const acknowledgedKey = useCriticalAlertStore((s) => s.acknowledgedKey);
  const clearAcknowledged = useCriticalAlertStore((s) => s.clearAcknowledged);
  const raisedKey = raised?.key ?? null;

  useEffect(() => {
    if (acknowledgedKey !== null && raisedKey !== acknowledgedKey) {
      clearAcknowledged();
    }
  }, [raisedKey, acknowledgedKey, clearAcknowledged]);

  return raised !== null && raised.key !== acknowledgedKey ? raised : null;
};

export const useCriticalAlertKey = (): SignalKey | null =>
  useRaisedAlert()?.key ?? null;

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
    threshold: criticalAlertThreshold(holding.key),
    rows: criticalAlertRows(values, sinceSeconds),
  };
};
