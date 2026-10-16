import { STRINGS } from "../strings";
import { ChartSeriesColors } from "../theme/ui-tokens";
import { SIGNAL_META, type SignalKey } from "../constants/ble";

export const GRAPH_WINDOWS = [30, 60, 120] as const;

export type GraphWindow = (typeof GRAPH_WINDOWS)[number];

export const DEFAULT_GRAPH_WINDOW: GraphWindow = 60;

export const MAX_GRAPH_SIGNALS = ChartSeriesColors.length;

export const DEFAULT_GRAPH_SIGNALS: readonly SignalKey[] = ["r", "op", "ct"];

export const ALL_GRAPH_SIGNALS = Object.keys(SIGNAL_META) as SignalKey[];

const DASHED_SERIES_INDEX = 2;

export const GRAPH_WINDOW_LABELS: Record<GraphWindow, string> = {
  30: STRINGS.graph.window30s,
  60: STRINGS.graph.window1min,
  120: STRINGS.graph.window2min,
};

export interface SeriesStyle {
  color: string;
  dashed: boolean;
}

export const seriesStyle = (index: number): SeriesStyle => ({
  color: ChartSeriesColors[index % ChartSeriesColors.length] ?? "",
  dashed: index === DASHED_SERIES_INDEX,
});

export const axisLabels = (window: GraphWindow): readonly string[] => [
  STRINGS.graph.axisAgo(window),
  STRINGS.graph.axisAgo(window / 2),
  STRINGS.graph.axisNow,
];

export const toggleSignal = (
  selected: readonly SignalKey[],
  key: SignalKey,
): SignalKey[] => {
  if (selected.includes(key)) return selected.filter((k) => k !== key);
  if (selected.length >= MAX_GRAPH_SIGNALS) return [...selected];
  return [...selected, key];
};

export const matchingSignals = (query: string): SignalKey[] => {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return ALL_GRAPH_SIGNALS;
  return ALL_GRAPH_SIGNALS.filter((key) =>
    SIGNAL_META[key].label.toLowerCase().includes(needle),
  );
};

export const signalNames = (signals: readonly SignalKey[]): string =>
  signals.map((key) => SIGNAL_META[key].label).join(", ");
