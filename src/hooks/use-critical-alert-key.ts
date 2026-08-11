import { useMemo } from "react";
import { useSignalsStore, useSignalsIsLive } from "../stores/signals.store";
import { useCriticalAlertStore } from "../stores/critical-alert.store";
import { selectCriticalAlert } from "../lib/critical-alert";
import type { SignalKey } from "../constants/ble";

export const useCriticalAlertKey = (): SignalKey | null => {
  const values = useSignalsStore((s) => s.values);
  const isLive = useSignalsIsLive();
  const mutedKeys = useCriticalAlertStore((s) => s.mutedKeys);
  const muted = useMemo(() => new Set(mutedKeys), [mutedKeys]);
  if (!isLive) return null;
  return selectCriticalAlert(values, muted)?.key ?? null;
};
