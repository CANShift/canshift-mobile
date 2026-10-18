import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiFonts, UiRadius } from "../../theme/ui-tokens";
import type { AlertEntry } from "../../lib/alert-model";
import { alertSince } from "../../lib/alert-text";
import { useAlertContext } from "../../hooks/use-alerts";

interface AlertContextRowsProps {
  entry: AlertEntry;
}

export const AlertContextRows = ({ entry }: AlertContextRowsProps) => {
  const rows = [
    ...useAlertContext(),
    { label: STRINGS.alert.since, value: alertSince(entry.activeSeconds) },
  ];
  return (
    <View style={styles.context}>
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[
            styles.contextRow,
            index < rows.length - 1 ? styles.rule : null,
          ]}
        >
          <Text style={styles.contextLabel}>{row.label}</Text>
          <Text style={styles.contextValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  context: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: UiRadius.card,
    backgroundColor: UiColors.alertPanel,
  },
  contextRow: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rule: { borderBottomWidth: 1, borderBottomColor: UiColors.alertRule },
  contextLabel: { fontSize: 18, color: UiColors.onPrimary },
  contextValue: {
    fontSize: 18,
    fontFamily: UiFonts.numeric,
    fontWeight: "700",
    color: UiColors.onPrimary,
  },
});
