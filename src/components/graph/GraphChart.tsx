import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Polyline } from "react-native-svg";
import type { SignalKey } from "../../constants/ble";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import { buildPoints } from "../../lib/graph-math";
import {
  GRAPH_WINDOW_LABELS,
  axisLabels,
  seriesStyle,
  signalNames,
  type GraphWindow,
} from "../../lib/graph-config";
import type { GraphSeries } from "../../hooks/use-graph-series";

const VIEW_W = 334;
const VIEW_H = 300;
const GRID_ROWS = [0.25, 0.5, 0.75];
const TRACE_WIDTH = 2.5;
const DASH = "6 4";
const NO_DASH = "0";

export interface GraphChartProps {
  series: GraphSeries;
  signals: readonly SignalKey[];
  window: GraphWindow;
}

const GridLines = () => (
  <>
    {GRID_ROWS.map((row) => (
      <Line
        key={row}
        x1={0}
        x2={VIEW_W}
        y1={VIEW_H * row}
        y2={VIEW_H * row}
        stroke={UiColors.borderRow}
        strokeWidth={1}
      />
    ))}
    <Line
      x1={VIEW_W / 2}
      x2={VIEW_W / 2}
      y1={0}
      y2={VIEW_H}
      stroke={UiColors.borderRow}
      strokeWidth={1}
    />
  </>
);

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
        <GridLines />
        {signals.map((key, index) => {
          const style = seriesStyle(index);
          return (
            <Polyline
              key={key}
              points={buildPoints(
                series.rolling,
                key,
                series.windowStart,
                series.windowEnd,
                VIEW_W,
                VIEW_H,
              )}
              fill="none"
              stroke={style.color}
              strokeWidth={TRACE_WIDTH}
              strokeLinejoin="round"
              strokeDasharray={style.dashed ? DASH : NO_DASH}
            />
          );
        })}
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
