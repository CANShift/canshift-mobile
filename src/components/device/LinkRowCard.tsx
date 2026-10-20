import { Pressable, StyleSheet, Text } from "react-native";
import { Glyph } from "../icons/Glyph";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";

export interface LinkRowCardProps {
  label: string;
  onPress: () => void;
}

export const LinkRowCard = ({ label, onPress }: LinkRowCardProps) => (
  <Pressable
    style={styles.row}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Text style={styles.label}>{label}</Text>
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
