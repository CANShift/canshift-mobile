import { Pressable, StyleSheet, Text } from "react-native";
import { Glyph } from "../icons/Glyph";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";

export interface BackRowProps {
  label: string;
  onPress: () => void;
}

export const BackRow = ({ label, onPress }: BackRowProps) => (
  <Pressable
    style={styles.back}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Glyph
      name="back"
      size={22}
      color={UiColors.textSecondary}
      strokeWidth={2}
    />
    <Text style={styles.label}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  back: {
    minHeight: TouchTarget.min,
    alignSelf: "flex-start",
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  label: { fontSize: 16, color: UiColors.textSecondary },
});
