import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiFonts } from "../../theme/ui-tokens";
import { bestLapMs, type TimedLap } from "../../lib/lap-deltas";
import { formatChrono } from "../../lib/lap-time";
import { NO_VALUE } from "../../lib/tile-state";

export interface BestLastRowProps {
  laps: readonly TimedLap[];
}

const chronoOrNone = (ms: number | null | undefined): string =>
  ms === null || ms === undefined ? NO_VALUE : formatChrono(ms);

export const BestLastRow = ({ laps }: BestLastRowProps) => {
  const stats = [
    { label: STRINGS.laps.best, value: chronoOrNone(bestLapMs(laps)) },
    { label: STRINGS.laps.last, value: chronoOrNone(laps.at(-1)?.ms) },
  ];
  return (
    <View style={styles.row}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.stat} accessible>
          <Text style={styles.label}>{stat.label}</Text>
          <Text style={styles.value}>{stat.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 24,
    rowGap: 4,
    paddingHorizontal: 4,
  },
  stat: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  label: { fontSize: 15, color: UiColors.textMuted },
  value: {
    fontSize: 22,
    fontFamily: UiFonts.numeric,
    fontWeight: "700",
    color: UiColors.textSecondary,
  },
});
