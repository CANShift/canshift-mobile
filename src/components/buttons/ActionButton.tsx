import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { UiColors, UiRadius } from "../../theme/ui-tokens";

type ActionTone = "filled" | "outline";

interface ToneLook {
  background: string;
  borderColor: string;
  color: string;
  fontWeight: "700" | "400";
}

const TONES: Record<ActionTone, ToneLook> = {
  filled: {
    background: UiColors.text,
    borderColor: UiColors.text,
    color: UiColors.bg,
    fontWeight: "700",
  },
  outline: {
    background: UiColors.surface,
    borderColor: UiColors.border,
    color: UiColors.text,
    fontWeight: "400",
  },
};

const DISABLED: ToneLook = {
  background: UiColors.surface2,
  borderColor: UiColors.border,
  color: UiColors.textStale,
  fontWeight: "700",
};

export interface ActionButtonProps {
  label: string;
  tone: ActionTone;
  height: number;
  onPress: () => void;
  disabled?: boolean;
  icon?: (color: string) => ReactNode;
}

export const ActionButton = ({
  label,
  tone,
  height,
  onPress,
  disabled = false,
  icon,
}: ActionButtonProps) => {
  const look = disabled ? DISABLED : TONES[tone];
  return (
    <Pressable
      style={[
        styles.button,
        {
          height,
          backgroundColor: look.background,
          borderColor: look.borderColor,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      {icon?.(look.color)}
      <Text
        style={[
          styles.label,
          { color: look.color, fontWeight: look.fontWeight },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: UiRadius.tile,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: { fontSize: 16 },
});
