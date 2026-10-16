import { StyleSheet, Text, View } from "react-native";
import { UiColors } from "../../theme/ui-tokens";
import { Glyph, type GlyphName } from "../icons/Glyph";

export type TagTone =
  "success" | "successOutline" | "warning" | "warningOutline" | "neutral";

interface TagLook {
  background: string;
  borderColor: string;
  color: string;
  dot: string | null;
}

const LOOKS: Record<TagTone, TagLook> = {
  success: {
    background: UiColors.successBg,
    borderColor: UiColors.successBg,
    color: UiColors.successText,
    dot: UiColors.success,
  },
  successOutline: {
    background: "transparent",
    borderColor: UiColors.success,
    color: UiColors.success,
    dot: null,
  },
  warning: {
    background: UiColors.warningBg,
    borderColor: UiColors.warningBg,
    color: UiColors.warningText,
    dot: null,
  },
  warningOutline: {
    background: "transparent",
    borderColor: UiColors.warning,
    color: UiColors.warning,
    dot: null,
  },
  neutral: {
    background: UiColors.surface2,
    borderColor: UiColors.surface2,
    color: UiColors.textSecondary,
    dot: null,
  },
};

const TAG_HEIGHT = 30;
const TAG_TEXT = 13;
const DOT = 8;

export interface StatusTagProps {
  label: string;
  tone: TagTone;
  glyph?: GlyphName;
}

export const StatusTag = ({ label, tone, glyph }: StatusTagProps) => {
  const look = LOOKS[tone];
  return (
    <View
      style={[
        styles.tag,
        { backgroundColor: look.background, borderColor: look.borderColor },
      ]}
    >
      {look.dot === null ? null : (
        <View style={[styles.dot, { backgroundColor: look.dot }]} />
      )}
      {glyph === undefined ? null : (
        <Glyph name={glyph} size={14} color={look.color} />
      )}
      <Text style={[styles.text, { color: look.color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    height: TAG_HEIGHT,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
  text: {
    fontSize: TAG_TEXT,
    fontWeight: "800",
    letterSpacing: TAG_TEXT * 0.06,
  },
});
