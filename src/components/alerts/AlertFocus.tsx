import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import {
  TouchTarget,
  UiColors,
  UiFonts,
  UiRadius,
} from "../../theme/ui-tokens";
import type { AlertEntry } from "../../lib/alert-model";
import {
  alertLimit,
  alertSince,
  alertSpoken,
  alertTitle,
  alertValue,
} from "../../lib/alert-text";
import { useAlertContext } from "../../hooks/use-alerts";
import { useIsLandscape } from "../../hooks/use-is-landscape";
import { BigButton } from "../buttons/BigButton";
import { AlertReading } from "./AlertReading";

const VALUE_SIZE = 132;
const VALUE_SIZE_LANDSCAPE = 110;
const ACK_HEIGHT = 96;

export interface AlertFocusProps {
  entry: AlertEntry;
  onAcknowledge: () => void;
  onMute: () => void;
}

const ContextRows = ({ entry }: { entry: AlertEntry }) => {
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
        <ContextRows entry={entry} />
      </View>
      <View style={styles.actions}>
        <BigButton
          label={STRINGS.alert.acknowledge}
          tone="light"
          height={ACK_HEIGHT}
          onPress={onAcknowledge}
        />
        <BigButton
          label={STRINGS.alert.mute}
          tone="onAlert"
          height={TouchTarget.driving + 8}
          onPress={onMute}
          glyph="mute"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  column: { flex: 1, gap: 14 },
  row: { flex: 1, flexDirection: "row", gap: 28 },
  details: { flex: 1, gap: 14 },
  actions: { justifyContent: "flex-end", gap: 10, minWidth: 260 },
  title: {
    marginTop: 16,
    fontSize: 42,
    lineHeight: 44,
    fontWeight: "800",
    color: UiColors.onPrimary,
  },
  limit: { fontSize: 22, fontWeight: "600", color: UiColors.onPrimary },
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
