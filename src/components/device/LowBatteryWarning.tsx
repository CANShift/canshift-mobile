import { StyleSheet, Text, View } from "react-native";
import { LOGGING_CUTOFF_PERCENT } from "../../lib/phone-battery";
import { Colors, Fonts, SCREEN_PADDING } from "../../theme";

const KICKER = "PHONE BATTERY LOW";

const BODY = `Logging stops below ${String(LOGGING_CUTOFF_PERCENT)} % to protect the recording. The dash keeps running on its own.`;

const BAR_WIDTH = 3;
const KICKER_SIZE = 13;
const KICKER_TRACKING = KICKER_SIZE * 0.18;
const BODY_SIZE = 17;
const BODY_LINE_HEIGHT = 27;
const BLOCK_PADDING_VERTICAL = 18;
const BLOCK_PADDING_HORIZONTAL = 21;
const KICKER_GAP = 10;
const BLOCK_MARGIN_TOP = 26;

export const LowBatteryWarning = () => (
  <View
    style={styles.block}
    accessibilityRole="alert"
    accessibilityLiveRegion="polite"
  >
    <Text style={styles.kicker}>{KICKER}</Text>
    <Text style={styles.body}>{BODY}</Text>
  </View>
);

const styles = StyleSheet.create({
  block: {
    borderLeftWidth: BAR_WIDTH,
    borderLeftColor: Colors.warning,
    marginHorizontal: SCREEN_PADDING,
    marginTop: BLOCK_MARGIN_TOP,
    paddingVertical: BLOCK_PADDING_VERTICAL,
    paddingHorizontal: BLOCK_PADDING_HORIZONTAL,
  },
  kicker: {
    fontFamily: Fonts.mono,
    fontSize: KICKER_SIZE,
    letterSpacing: KICKER_TRACKING,
    color: Colors.warning,
    marginBottom: KICKER_GAP,
  },
  body: {
    fontFamily: Fonts.mono,
    fontSize: BODY_SIZE,
    lineHeight: BODY_LINE_HEIGHT,
    color: Colors.text,
  },
});
