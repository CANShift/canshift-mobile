import { ScrollView, StyleSheet, View } from "react-native";
import { Colors, Spacing } from "../../theme";
import {
  PRIMARY_SIGNALS,
  GRID_SIGNALS,
  GAUGE_SIZE_LANDSCAPE,
  GRID_CELL_HEIGHT_LANDSCAPE,
  GRID_CELL_WIDTH_LANDSCAPE,
  TIMER_WIDTH,
  TIMER_HEIGHT,
} from "../../constants/dash-layout";
import { TimerWidget } from "../widgets";
import { PrimaryGauge } from "./PrimaryGauge";
import { GridLabel } from "./GridLabel";

export const DashLandscapeLayout = ({ dayMode }: { dayMode: boolean }) => (
  <View style={styles.body}>
    <View style={styles.primaryRow}>
      {PRIMARY_SIGNALS.map((key) => (
        <PrimaryGauge
          key={key}
          signalKey={key}
          size={GAUGE_SIZE_LANDSCAPE}
          dayMode={dayMode}
        />
      ))}
      <TimerWidget
        width={TIMER_WIDTH}
        height={TIMER_HEIGHT}
        dayMode={dayMode}
      />
    </View>
    <ScrollView
      style={styles.right}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
    >
      {GRID_SIGNALS.map((key) => (
        <GridLabel
          key={key}
          signalKey={key}
          width={GRID_CELL_WIDTH_LANDSCAPE}
          height={GRID_CELL_HEIGHT_LANDSCAPE}
          dayMode={dayMode}
        />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  body: { flex: 1, flexDirection: "column" },
  primaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  right: { flex: 1 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
});
