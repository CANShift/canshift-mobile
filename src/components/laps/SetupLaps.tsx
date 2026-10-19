import { StyleSheet, View } from "react-native";
import type { TimedLap } from "../../lib/lap-deltas";
import { LapLines } from "./LapLines";

interface SetupLapsProps {
  laps: readonly TimedLap[];
}

export const SetupLaps = ({ laps }: SetupLapsProps) =>
  laps.length === 0 ? <View style={styles.spacer} /> : <LapLines laps={laps} />;

const styles = StyleSheet.create({
  spacer: { flex: 1 },
});
