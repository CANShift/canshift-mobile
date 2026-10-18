import { StyleSheet, Text, View } from "react-native";
import { UiColors } from "../../theme/ui-tokens";
import type { AlertEntry } from "../../lib/alert-model";
import {
  alertLimit,
  alertSpoken,
  alertTitle,
  alertValue,
} from "../../lib/alert-text";
import { useIsLandscape } from "../../hooks/use-is-landscape";
import { AlertReading } from "./AlertReading";
import { AlertContextRows } from "./AlertContextRows";
import { AlertFocusActions } from "./AlertFocusActions";

const VALUE_SIZE = 132;
const VALUE_SIZE_LANDSCAPE = 110;

export interface AlertFocusProps {
  entry: AlertEntry;
  onAcknowledge: () => void;
  onMute: () => void;
}

export const AlertFocus = ({
  entry,
  onAcknowledge,
  onMute,
}: AlertFocusProps) => {
  const landscape = useIsLandscape();
  return (
    <View style={landscape ? styles.row : styles.column}>
      <View
        style={styles.details}
        accessible
        accessibilityRole="alert"
        accessibilityLabel={alertSpoken(entry)}
      >
        <Text style={styles.title}>{alertTitle(entry)}</Text>
        <AlertReading
          value={alertValue(entry)}
          unit={entry.unit}
          valueSize={landscape ? VALUE_SIZE_LANDSCAPE : VALUE_SIZE}
        />
        <Text style={styles.limit}>{alertLimit(entry)}</Text>
        <AlertContextRows entry={entry} />
      </View>
      <AlertFocusActions onAcknowledge={onAcknowledge} onMute={onMute} />
    </View>
  );
};

const styles = StyleSheet.create({
  column: { flex: 1, gap: 14 },
  row: { flex: 1, flexDirection: "row", gap: 28 },
  details: { flex: 1, gap: 14 },
  title: {
    marginTop: 16,
    fontSize: 42,
    lineHeight: 44,
    fontWeight: "800",
    color: UiColors.onPrimary,
  },
  limit: { fontSize: 22, fontWeight: "600", color: UiColors.onPrimary },
});
