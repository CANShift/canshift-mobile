import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import {
  GRAPH_WINDOWS,
  GRAPH_WINDOW_LABELS,
  type GraphWindow,
} from "../../lib/graph-config";
import { Segmented } from "../controls/Segmented";

const WINDOW_OPTIONS = GRAPH_WINDOWS.map((value) => ({
  value,
  label: GRAPH_WINDOW_LABELS[value],
}));

export interface GraphHeaderProps {
  window: GraphWindow;
  paused: boolean;
  onWindow: (window: GraphWindow) => void;
}

export const GraphHeader = ({ window, paused, onWindow }: GraphHeaderProps) => (
  <View style={styles.row}>
    <View style={styles.title}>
      <Text style={styles.heading} accessibilityRole="header">
        {STRINGS.graph.title}
      </Text>
      {paused ? (
        <Text style={styles.paused}>{STRINGS.graph.paused}</Text>
      ) : null}
    </View>
    <Segmented
      options={WINDOW_OPTIONS}
      value={window}
      onChange={onWindow}
      accessibilityLabel={STRINGS.graph.timeWindow}
    />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: { flexDirection: "row", alignItems: "center", gap: 8 },
  heading: { fontSize: 26, fontWeight: "700", color: UiColors.text },
  paused: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: UiColors.warning,
  },
});
