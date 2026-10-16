import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";
import type { AlertEntry } from "../../lib/alert-model";
import {
  alertLimit,
  alertSince,
  alertSpoken,
  alertTitle,
  alertValue,
} from "../../lib/alert-text";
import { useAlertContext } from "../../hooks/use-alerts";
import { BigButton } from "../buttons/BigButton";
import { AlertReading } from "./AlertReading";

const VALUE_SIZE = 72;

export interface AlertCardProps {
  entry: AlertEntry;
  onAcknowledge: () => void;
}

export const AlertCard = ({ entry, onAcknowledge }: AlertCardProps) => {
  const context = useAlertContext()
    .map((row) => `${row.label} ${row.value}`)
    .join(" · ");
  return (
    <View style={styles.card}>
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
      <BigButton
        label={STRINGS.alert.acknowledge}
        tone="light"
        height={TouchTarget.glove}
        onPress={onAcknowledge}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 8,
    borderRadius: UiRadius.sheet,
    backgroundColor: UiColors.alertPanel,
  },
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
