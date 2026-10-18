import { StyleSheet, Text, View } from "react-native";
import Svg from "react-native-svg";
import type { SignalKey } from "../../constants/ble";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import {
  GRAPH_WINDOW_LABELS,
  axisLabels,
  signalNames,
  type GraphWindow,
} from "../../lib/graph-config";
import type { GraphSeries } from "../../hooks/use-graph-series";
import { VIEW_H, VIEW_W } from "./graph-view-box";
import { GraphGridLines } from "./GraphGridLines";
import { GraphTraces } from "./GraphTraces";

export interface GraphChartProps {
  series: GraphSeries;
  signals: readonly SignalKey[];
  window: GraphWindow;
}

export const GraphChart = ({ series, signals, window }: GraphChartProps) => (
  <View style={styles.figure}>
    <View style={styles.plot}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}
        preserveAspectRatio="none"
        accessibilityRole="image"
        accessibilityLabel={STRINGS.graph.chartLabel(
          signalNames(signals),
          GRAPH_WINDOW_LABELS[window],
        )}
      >
        <GraphGridLines />
        <GraphTraces series={series} signals={signals} />
      </Svg>
    </View>
    <View style={styles.axis}>
      {axisLabels(window).map((label) => (
        <Text key={label} style={styles.axisLabel}>
          {label}
        </Text>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  figure: {
    flex: 1,
    minHeight: 0,
    padding: 12,
    paddingBottom: 8,
    gap: 6,
    borderRadius: UiRadius.card,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
  },
  plot: { flex: 1, minHeight: 0 },
  axis: { flexDirection: "row", justifyContent: "space-between" },
  axisLabel: { fontSize: 12, color: UiColors.textMuted },
});
