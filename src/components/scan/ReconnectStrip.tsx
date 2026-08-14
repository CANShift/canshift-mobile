import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Fonts, HitSlop } from "../../theme";

const STRIP_TEXT_SIZE = 15;
const STRIP_PADDING_VERTICAL = 14;
const STRIP_MARGIN_TOP = 18;
const STRIP_RULE = 3;
const STRIP_PADDING_LEFT = 16;

export interface ReconnectStripProps {
  attempt: number;
  maxAttempts: number;
  onCancel: () => void;
}

export const ReconnectStrip = ({
  attempt,
  maxAttempts,
  onCancel,
}: ReconnectStripProps) => (
  <View style={styles.strip}>
    <Text style={styles.text}>
      {`Reconnecting… ${String(attempt)}/${String(maxAttempts)}`}
    </Text>
    <TouchableOpacity
      onPress={onCancel}
      hitSlop={HitSlop.default}
      accessibilityRole="button"
      accessibilityLabel="Cancel reconnecting"
    >
      <Text style={styles.cancel}>Cancel</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: STRIP_RULE,
    borderLeftColor: Colors.warning,
    paddingLeft: STRIP_PADDING_LEFT,
    paddingVertical: STRIP_PADDING_VERTICAL,
    marginTop: STRIP_MARGIN_TOP,
  },
  text: {
    fontFamily: Fonts.mono,
    fontSize: STRIP_TEXT_SIZE,
    color: Colors.text,
    flexShrink: 1,
  },
  cancel: {
    fontFamily: Fonts.mono,
    fontSize: STRIP_TEXT_SIZE,
    color: Colors.accent,
  },
});
