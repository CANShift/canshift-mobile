import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import type { AlertEntry } from "../../lib/alert-model";
import {
  alertLimit,
  alertSince,
  alertSpoken,
  alertTitle,
  alertValue,
} from "../../lib/alert-text";
import { useAlertContext } from "../../hooks/use-alerts";
import { AlertReading } from "./AlertReading";

const VALUE_SIZE = 72;

interface AlertCardDetailsProps {
  entry: AlertEntry;
}

export const AlertCardDetails = ({ entry }: AlertCardDetailsProps) => {
  const context = useAlertContext()
    .map((row) => `${row.label} ${row.value}`)
    .join(" · ");
  return (
    <View
      style={styles.details}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={alertSpoken(entry)}
    >
      <View style={styles.head}>
        <Text style={styles.title}>{alertTitle(entry)}</Text>
        <Text style={styles.since}>
          {STRINGS.alert.sinceTime(alertSince(entry.activeSeconds))}
        </Text>
      </View>
      <AlertReading
        value={alertValue(entry)}
        unit={entry.unit}
        valueSize={VALUE_SIZE}
      />
      <Text style={styles.limit}>{alertLimit(entry)}</Text>
      <Text style={styles.context}>{context}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  details: { gap: 8 },
  head: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    lineHeight: 27,
    fontWeight: "800",
    color: UiColors.onPrimary,
  },
  since: { fontSize: 14, fontWeight: "600", color: UiColors.onPrimary },
  limit: { fontSize: 17, fontWeight: "600", color: UiColors.onPrimary },
  context: { fontSize: 15, color: UiColors.onPrimary },
});
