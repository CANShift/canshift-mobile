import { ScrollView, StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiFonts, UiRadius } from "../../theme/ui-tokens";
import { lapLines, type TimedLap } from "../../lib/lap-deltas";

const ROW_HEIGHT = 52;

export interface LapLinesProps {
  laps: readonly TimedLap[];
}

const EmptyLaps = () => (
  <View style={styles.empty}>
    <Text style={styles.emptyText}>{STRINGS.laps.noLapsYet}</Text>
  </View>
);

export const LapLines = ({ laps }: LapLinesProps) => {
  if (laps.length === 0) return <EmptyLaps />;
  return (
    <ScrollView style={styles.card}>
      {lapLines(laps).map((line) => (
        <View key={line.key} style={styles.row} accessible>
          <Text style={styles.label}>{line.label}</Text>
          <Text style={styles.time}>{line.time}</Text>
          <Text style={[styles.delta, line.isBest ? styles.best : null]}>
            {line.delta}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 0,
    borderRadius: UiRadius.card,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
  },
  row: {
    height: ROW_HEIGHT,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: UiColors.borderRow,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: { width: 56, fontSize: 15, color: UiColors.textMuted },
  time: {
    flex: 1,
    fontSize: 20,
    fontFamily: UiFonts.numeric,
    fontWeight: "700",
    color: UiColors.text,
  },
  delta: {
    fontSize: 15,
    fontFamily: UiFonts.numeric,
    fontWeight: "700",
    color: UiColors.textSecondary,
  },
  best: { color: UiColors.success },
  empty: {
    flex: 1,
    minHeight: 80,
    borderRadius: UiRadius.card,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: UiColors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontSize: 16, color: UiColors.textMuted },
});
