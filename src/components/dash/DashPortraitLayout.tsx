import { ScrollView, StyleSheet, View } from "react-native";
import { Spacing, SCREEN_PADDING } from "../../theme";
import {
  PRIMARY_SIGNALS,
  GRID_SIGNALS,
  GAUGE_SIZE_PORTRAIT,
  GRID_CELL_HEIGHT,
  TIMER_WIDTH,
  TIMER_HEIGHT,
} from "../../constants/dash-layout";
import { TimerWidget } from "../widgets";
import { PrimaryGauge } from "./PrimaryGauge";
import { GridLabel } from "./GridLabel";
import { WarningStrip } from "./WarningStrip";

export interface DashPortraitLayoutProps {
  dayMode: boolean;
  cellWidth: number;
}

export const DashPortraitLayout = ({
  dayMode,
  cellWidth,
}: DashPortraitLayoutProps) => (
  <ScrollView
    contentContainerStyle={styles.scroll}
    showsVerticalScrollIndicator={false}
  >
    <View style={styles.primaryRow}>
      {PRIMARY_SIGNALS.map((key) => (
        <PrimaryGauge
          key={key}
          signalKey={key}
          size={GAUGE_SIZE_PORTRAIT}
          dayMode={dayMode}
        />
      ))}
    </View>
    <View style={styles.grid}>
      {GRID_SIGNALS.map((key) => (
        <GridLabel
          key={key}
          signalKey={key}
          width={cellWidth}
          height={GRID_CELL_HEIGHT}
          dayMode={dayMode}
        />
      ))}
    </View>
    <View style={styles.footerRow}>
      <TimerWidget
        width={TIMER_WIDTH}
        height={TIMER_HEIGHT}
        dayMode={dayMode}
      />
      <WarningStrip dayMode={dayMode} />
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: { padding: SCREEN_PADDING, gap: Spacing.lg },
  primaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
