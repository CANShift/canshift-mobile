import { Pressable, StyleSheet, Text } from "react-native";
import { Glyph } from "../icons/Glyph";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";

export interface ConsoleLinkCardProps {
  onPress: () => void;
}

export const ConsoleLinkCard = ({ onPress }: ConsoleLinkCardProps) => (
  <Pressable
    style={styles.row}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={STRINGS.device.console}
  >
    <Text style={styles.label}>{STRINGS.device.console}</Text>
    <Glyph
      name="chevron"
      size={20}
      color={UiColors.textMuted}
      strokeWidth={2}
    />
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    minHeight: TouchTarget.driving,
    paddingHorizontal: 16,
    borderRadius: UiRadius.card,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
    flexDirection: "row",
    alignItems: "center",
  },
  label: { flex: 1, fontSize: 17, color: UiColors.text },
});
