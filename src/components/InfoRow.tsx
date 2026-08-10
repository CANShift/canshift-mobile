import { View, Text, StyleSheet } from "react-native";
import { Colors, Fonts, Typography, Spacing } from "../theme";

export interface InfoRowProps {
  label: string;
  value: string;
  muted?: boolean;
}

export const InfoRow = ({ label, value, muted = false }: InfoRowProps) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, muted && styles.valueMuted]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.md,
  },
  label: {
    fontFamily: Fonts.ui,
    fontSize: Typography.sm,
    color: Colors.textMuted,
  },
  value: {
    flexShrink: 1,
    textAlign: "right",
    fontSize: Typography.sm,
    fontFamily: Fonts.monoBold,
    fontVariant: ["tabular-nums"],
    color: Colors.text,
  },
  valueMuted: {
    color: Colors.textDim,
    fontFamily: Fonts.mono,
  },
});
