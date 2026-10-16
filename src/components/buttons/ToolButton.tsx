import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";

const TOOL_HIT_SLOP = { top: 6, bottom: 6 };

export interface ToolButtonProps {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
}

export const ToolButton = ({ label, onPress, icon }: ToolButtonProps) => (
  <Pressable
    style={styles.button}
    onPress={onPress}
    hitSlop={TOOL_HIT_SLOP}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    {icon}
    <Text style={styles.label}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    minHeight: TouchTarget.min,
    paddingHorizontal: 14,
    borderRadius: UiRadius.control,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: { fontSize: 15, color: UiColors.text },
});
