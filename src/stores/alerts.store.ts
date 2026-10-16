import { create } from "zustand";
import type { AlertSource } from "@canshift/core";
import type { AlertEntry, AlertFeed } from "../lib/alert-model";

interface AlertsState {
  feed: AlertFeed;
  active: readonly AlertEntry[];
  acknowledged: readonly AlertSource[];
  muted: readonly AlertSource[];
}

export const useAlertsStore = create<AlertsState>()(() => ({
  feed: "local",
  active: [],
  acknowledged: [],
  muted: [],
}));

const without = (
  sources: readonly AlertSource[],
  source: AlertSource,
): AlertSource[] => sources.filter((known) => known !== source);

const withSource = (
  sources: readonly AlertSource[],
  source: AlertSource,
): readonly AlertSource[] =>
  sources.includes(source) ? sources : [...sources, source];

export const publishAlerts = (
  feed: AlertFeed,
  active: readonly AlertEntry[],
): void => {
  useAlertsStore.setState((s) => {
    if (s.feed !== feed) return s;
    const present = new Set(active.map((entry) => entry.source));
    return {
      active,
      acknowledged: s.acknowledged.filter((source) => present.has(source)),
    };
  });
};

export const switchAlertFeed = (feed: AlertFeed): void => {
  useAlertsStore.setState((s) =>
    s.feed === feed ? s : { feed, active: [], acknowledged: [] },
  );
};

export const acknowledgeAlert = (source: AlertSource): void => {
  useAlertsStore.setState((s) => ({
    acknowledged: withSource(s.acknowledged, source),
  }));
};

export const reopenAlert = (source: AlertSource): void => {
  useAlertsStore.setState((s) => ({
    acknowledged: without(s.acknowledged, source),
  }));
};

export const muteAlerts = (sources: readonly AlertSource[]): void => {
  useAlertsStore.setState((s) => ({
    muted: sources.reduce(withSource, s.muted),
  }));
};

export const unmuteAlert = (source: AlertSource): void => {
  useAlertsStore.setState((s) => ({ muted: without(s.muted, source) }));
};
