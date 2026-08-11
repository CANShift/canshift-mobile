import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Typography, Spacing } from "../../theme";
import type { ScanStatus } from "../../hooks/use-device-scan";

export interface ScanStatusNoteProps {
  status: ScanStatus;
}

export const ScanStatusNote = ({ status }: ScanStatusNoteProps) => {
  if (status === "idle") return null;
  if (status === "searching") {
    return <Text style={styles.hint}>Searching for CANShift devices…</Text>;
  }
  return (
    <View
      style={styles.empty}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.title}>No dashboards found</Text>
      <Text style={styles.body}>
        Make sure your dashboard is powered on and in range, then scan again.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  hint: {
    fontFamily: Fonts.ui,
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  empty: {
    alignItems: "center",
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.md,
    color: Colors.text,
  },
  body: {
    fontFamily: Fonts.ui,
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
