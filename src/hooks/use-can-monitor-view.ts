import { useCallback, useMemo, useState } from "react";
import {
  useCanMonitorStore,
  type CanFeedState,
} from "../stores/can-monitor.store";
import {
  busRateHz,
  sortedCanRows,
  type CanMonitorSnapshot,
  type CanRow,
} from "../lib/can-monitor-model";
import { filterCanRows } from "../lib/can-row-filter";

export type CanViewState = "off" | "unavailable" | "listening" | "rows";

export interface CanMonitorView {
  state: CanViewState;
  rows: readonly CanRow[];
  idCount: number;
  busHz: number;
  overflow: boolean;
  filter: string;
  setFilter: (filter: string) => void;
  paused: boolean;
  togglePause: () => void;
}

const viewState = (feed: CanFeedState, idCount: number): CanViewState => {
  if (feed !== "listening") return feed;
  return idCount === 0 ? "listening" : "rows";
};

export const useCanMonitorView = (): CanMonitorView => {
  const snapshot = useCanMonitorStore((s) => s.snapshot);
  const feed = useCanMonitorStore((s) => s.feed);
  const [frozen, setFrozen] = useState<CanMonitorSnapshot | null>(null);
  const [filter, setFilter] = useState("");
  const all = useMemo(
    () => sortedCanRows(frozen ?? snapshot),
    [frozen, snapshot],
  );
  const rows = useMemo(() => filterCanRows(all, filter), [all, filter]);
  const togglePause = useCallback(() => {
    setFrozen((current) => (current === null ? snapshot : null));
  }, [snapshot]);
  return {
    state: viewState(feed, all.length),
    rows,
    idCount: all.length,
    busHz: busRateHz(all),
    overflow: (frozen ?? snapshot).overflow,
    filter,
    setFilter,
    paused: frozen !== null,
    togglePause,
  };
};
