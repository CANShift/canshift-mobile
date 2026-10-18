import { create } from "zustand";
import type { AlertEntry, AlertFeed, AlertKey } from "../lib/alert-model";

interface AlertsState {
  feed: AlertFeed;
  active: readonly AlertEntry[];
  acknowledged: readonly AlertKey[];
  muted: readonly AlertKey[];
}

export const useAlertsStore = create<AlertsState>()(() => ({
  feed: "local",
  active: [],
  acknowledged: [],
  muted: [],
}));

const without = (keys: readonly AlertKey[], key: AlertKey): AlertKey[] =>
  keys.filter((known) => known !== key);

const withKey = (
  keys: readonly AlertKey[],
  key: AlertKey,
): readonly AlertKey[] => (keys.includes(key) ? keys : [...keys, key]);

export const publishAlerts = (
  feed: AlertFeed,
  active: readonly AlertEntry[],
): void => {
  useAlertsStore.setState((s) => {
    if (s.feed !== feed) return s;
    const present = new Set(active.map((entry) => entry.key));
    return {
      active,
      acknowledged: s.acknowledged.filter((key) => present.has(key)),
    };
  });
};

export const switchAlertFeed = (feed: AlertFeed): void => {
  useAlertsStore.setState((s) =>
    s.feed === feed ? s : { feed, active: [], acknowledged: [] },
  );
};

export const acknowledgeAlert = (key: AlertKey): void => {
  useAlertsStore.setState((s) => ({
    acknowledged: withKey(s.acknowledged, key),
  }));
};

export const reopenAlert = (key: AlertKey): void => {
  useAlertsStore.setState((s) => ({
    acknowledged: without(s.acknowledged, key),
  }));
};

export const muteAlerts = (keys: readonly AlertKey[]): void => {
  useAlertsStore.setState((s) => ({
    muted: keys.reduce(withKey, s.muted),
  }));
};

export const unmuteAlert = (key: AlertKey): void => {
  useAlertsStore.setState((s) => ({ muted: without(s.muted, key) }));
};

export const clearMutedAlerts = (): void => {
  useAlertsStore.setState({ muted: [] });
};
