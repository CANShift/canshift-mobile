import { Pressable, StyleSheet, Text } from "react-native";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import { Glyph, type GlyphName } from "../icons/Glyph";

export type BigButtonTone =
  "primary" | "light" | "outline" | "dangerOutline" | "onAlert";

interface BigLook {
  background: string;
  borderColor: string;
  color: string;
}

const LOOKS: Record<BigButtonTone, BigLook> = {
  primary: {
    background: UiColors.primaryBtn,
    borderColor: UiColors.primaryBtn,
    color: UiColors.onPrimary,
  },
  light: {
    background: UiColors.text,
    borderColor: UiColors.text,
    color: UiColors.bg,
  },
  outline: {
    background: "transparent",
    borderColor: UiColors.borderStrong,
    color: UiColors.text,
  },
  dangerOutline: {
    background: "transparent",
    borderColor: UiColors.borderStrong,
    color: UiColors.dangerValue,
  },
  onAlert: {
    background: "transparent",
    borderColor: UiColors.alertOutline,
    color: UiColors.onPrimary,
  },
};

const DISABLED: BigLook = {
  background: UiColors.surface2,
  borderColor: UiColors.border,
  color: UiColors.textStale,
};

export interface BigButtonProps {
  label: string;
  tone: BigButtonTone;
  height: number;
  onPress: () => void;
  disabled?: boolean;
  glyph?: GlyphName;
}

export const BigButton = ({
  label,
  tone,
  height,
  onPress,
  disabled = false,
  glyph,
}: BigButtonProps) => {
  const look = disabled ? DISABLED : LOOKS[tone];
  const fontSize = height >= 88 ? 24 : 18;
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
      {glyph === undefined ? null : (
        <Glyph name={glyph} size={22} color={look.color} />
      )}
      <Text style={[styles.label, { color: look.color, fontSize }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: "stretch",
    borderRadius: UiRadius.sheet,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  label: { fontWeight: "800" },
});
