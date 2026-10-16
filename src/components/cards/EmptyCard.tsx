import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { UiColors, UiRadius } from "../../theme/ui-tokens";

export interface EmptyCardProps {
  icon: ReactNode;
  title: string;
  body: string;
}

export const EmptyCard = ({ icon, title, body }: EmptyCardProps) => (
  <View style={styles.card}>
    {icon}
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.body}>{body}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 24,
    gap: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: UiRadius.card,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: UiColors.borderStrong,
    backgroundColor: UiColors.surface,
  },
  title: {
    fontSize: 19,
    fontWeight: "600",
    lineHeight: 26,
    color: UiColors.text,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: UiColors.textMuted,
    textAlign: "center",
  },
});
