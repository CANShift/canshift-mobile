import { decodeAlertFrame } from "@canshift/core";
import { useSignalsStore } from "../stores/signals.store";
import {
  publishAlerts,
  switchAlertFeed,
  useAlertsStore,
} from "../stores/alerts.store";
import { log } from "../stores/log.store";
import { freshValues } from "../lib/signal-staleness";
import { localAlerts, nextOnsets, type Onsets } from "../lib/local-alerts";
import { entryFromDash } from "../lib/alert-model";
import { decodeBase64ToBytes } from "./base64";

let onsets: Onsets = {};

const publishLocal = (): void => {
  if (useAlertsStore.getState().feed !== "local") return;
  const { values, lastAt, isLive } = useSignalsStore.getState();
  const nowMs = Date.now();
  const entries = isLive
    ? localAlerts(freshValues(values, lastAt, nowMs), onsets, nowMs)
    : [];
  onsets = nextOnsets(onsets, entries, nowMs);
  publishAlerts("local", entries);
};

export const startLocalAlertFeed = (): (() => void) => {
  onsets = {};
  return useSignalsStore.subscribe(publishLocal);
};

export const handleAlertFrame = (raw: string): void => {
  const alerts = decodeAlertFrame(decodeBase64ToBytes(raw));
  if (alerts === null) {
    log("warn", "BLE: rejected a malformed alert frame");
    return;
  }
  switchAlertFeed("dash");
  publishAlerts("dash", alerts.map(entryFromDash));
};

export const fallBackToLocalAlerts = (): void => {
  switchAlertFeed("local");
  onsets = {};
};
