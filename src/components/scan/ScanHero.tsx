import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { UiColors } from "../../theme/ui-tokens";

export interface ScanHeroProps {
  icon?: ReactNode;
  title: string;
  body: string;
  hint?: string;
}

export const ScanHero = ({ icon, title, body, hint }: ScanHeroProps) => (
  <View style={styles.hero}>
    {icon === undefined ? null : <View style={styles.icon}>{icon}</View>}
    <Text style={styles.title} accessibilityRole="header">
      {title}
    </Text>
    <Text style={styles.body}>{body}</Text>
    {hint === undefined ? null : <Text style={styles.hint}>{hint}</Text>}
  </View>
);

const styles = StyleSheet.create({
  hero: { gap: 18 },
  icon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: UiColors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    lineHeight: 37,
    fontWeight: "700",
    color: UiColors.text,
  },
  body: { fontSize: 18, lineHeight: 27, color: UiColors.textSecondary },
  hint: { fontSize: 15, lineHeight: 22, color: UiColors.textMuted },
});
