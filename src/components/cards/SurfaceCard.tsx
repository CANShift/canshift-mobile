import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { UiColors, UiRadius } from "../../theme/ui-tokens";

export type CardTone = "plain" | "danger" | "warning";

const TONES: Record<CardTone, ViewStyle> = {
  plain: {
    backgroundColor: UiColors.surface,
    borderColor: UiColors.border,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: UiColors.dangerBg,
    borderColor: UiColors.dangerBorder,
    borderWidth: 2,
  },
  warning: {
    backgroundColor: UiColors.warningBg,
    borderColor: UiColors.warning,
    borderWidth: 2,
  },
};

export interface SurfaceCardProps {
  tone?: CardTone;
  children: ReactNode;
}

export const SurfaceCard = ({ tone = "plain", children }: SurfaceCardProps) => (
  <View style={[styles.card, TONES[tone]]}>{children}</View>
);

const styles = StyleSheet.create({
  card: { borderRadius: UiRadius.card, padding: 16, gap: 10 },
});
