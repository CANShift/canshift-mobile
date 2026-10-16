import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiFonts, UiRadius } from "../../theme/ui-tokens";
import { bestLapMs, type TimedLap } from "../../lib/lap-deltas";
import { formatChrono } from "../../lib/lap-time";
import { NO_VALUE } from "../../lib/tile-state";

export interface StatTilesProps {
  laps: readonly TimedLap[];
}

const chronoOrNone = (ms: number | null | undefined): string =>
  ms === null || ms === undefined ? NO_VALUE : formatChrono(ms);

export const StatTiles = ({ laps }: StatTilesProps) => {
  const stats = [
    { label: STRINGS.laps.best, value: chronoOrNone(bestLapMs(laps)) },
    {
      label: STRINGS.laps.last,
      value: chronoOrNone(laps[laps.length - 1]?.ms),
    },
    { label: STRINGS.laps.laps, value: String(laps.length) },
  ];
  return (
    <View style={styles.row}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.tile} accessible>
          <Text style={styles.label}>{stat.label}</Text>
          <Text style={styles.value}>{stat.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  tile: {
    flex: 1,
    padding: 12,
    gap: 4,
    borderRadius: UiRadius.tile,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
  },
  label: { fontSize: 13, color: UiColors.textMuted },
  value: {
    fontSize: 21,
    fontFamily: UiFonts.numeric,
    fontWeight: "700",
    color: UiColors.text,
  },
});
