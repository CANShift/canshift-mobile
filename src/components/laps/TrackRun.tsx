import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiFonts } from "../../theme/ui-tokens";
import { lastVsBest, type TimedLap } from "../../lib/lap-deltas";
import { formatDelta } from "../../lib/lap-time";
import { StatusTag } from "./StatusTag";
import { Chrono } from "./Chrono";

export interface TrackRunProps {
  laps: readonly TimedLap[];
  currentLapMs: number;
}

const DeltaLine = ({ laps }: { laps: readonly TimedLap[] }) => {
  const delta = lastVsBest(laps);
  if (delta === null) return null;
  const ahead = delta <= 0;
  return (
    <Text style={[styles.delta, ahead ? styles.ahead : null]}>
      {formatDelta(delta)} <Text style={styles.vs}>{STRINGS.laps.vsBest}</Text>
    </Text>
  );
};

export const TrackRun = ({ laps, currentLapMs }: TrackRunProps) => (
  <View style={styles.run}>
    <View style={styles.head}>
      <StatusTag label={STRINGS.laps.trackModeTag} tone="success" />
      <Text style={styles.lap}>{STRINGS.laps.lapNumber(laps.length + 1)}</Text>
    </View>
    <Chrono ms={currentLapMs} />
    <DeltaLine laps={laps} />
  </View>
);

const styles = StyleSheet.create({
  run: { gap: 6, paddingTop: 6, paddingHorizontal: 4 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lap: { fontSize: 18, fontWeight: "700", color: UiColors.text },
  delta: {
    fontSize: 26,
    fontFamily: UiFonts.numeric,
    fontWeight: "700",
    color: UiColors.textSecondary,
  },
  ahead: { color: UiColors.success },
  vs: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "System",
    color: UiColors.textMuted,
  },
});
