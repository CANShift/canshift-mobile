import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";

export const SendWarning = () => (
  <View style={styles.warning}>
    <Glyph name="warning" size={20} color={UiColors.warning} strokeWidth={2} />
    <Text style={styles.warningText}>{STRINGS.console.sendHint}</Text>
  </View>
);

const styles = StyleSheet.create({
  warning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: UiRadius.tile,
    backgroundColor: UiColors.warningBg,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: UiColors.warningText,
  },
});
