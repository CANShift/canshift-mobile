import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts } from "../../theme";
import type { ScanStatus } from "../../hooks/use-device-scan";

const NOTE_SIZE = 14;
const TITLE_SIZE = 17;
const BODY_SIZE = 16;
const BODY_LINE_HEIGHT = 26;
const BLOCK_MARGIN_TOP = 26;
const NOTE_MARGIN_TOP = 18;
const BODY_MARGIN_TOP = 8;

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
    fontFamily: Fonts.mono,
    fontSize: NOTE_SIZE,
    color: Colors.textMuted,
    marginTop: NOTE_MARGIN_TOP,
  },
  empty: {
    marginTop: BLOCK_MARGIN_TOP,
  },
  title: {
    fontFamily: Fonts.mono,
    fontSize: TITLE_SIZE,
    color: Colors.text,
  },
  body: {
    fontFamily: Fonts.mono,
    fontSize: BODY_SIZE,
    lineHeight: BODY_LINE_HEIGHT,
    color: Colors.textMuted,
    marginTop: BODY_MARGIN_TOP,
  },
});
