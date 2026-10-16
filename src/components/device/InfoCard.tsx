import { StyleSheet, Text, View } from "react-native";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import type { InfoRowModel } from "../../hooks/use-device-screen";

export interface InfoCardProps {
  rows: readonly InfoRowModel[];
}

export const InfoCard = ({ rows }: InfoCardProps) => (
  <View style={styles.card}>
    {rows.map((row, index) => (
      <View
        key={row.label}
        style={[styles.row, index < rows.length - 1 ? styles.rule : null]}
        accessible
      >
        <Text style={styles.label}>{row.label}</Text>
        <Text style={styles.value} selectable>
          {row.value}
        </Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: UiRadius.card,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
  },
  row: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rule: { borderBottomWidth: 1, borderBottomColor: UiColors.borderRow },
  label: { fontSize: 15, color: UiColors.textMuted },
  value: {
    flexShrink: 1,
    fontSize: 15,
    color: UiColors.text,
    textAlign: "right",
  },
});
