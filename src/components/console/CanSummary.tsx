import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import type { CanMonitorView } from "../../hooks/use-can-monitor-view";

interface CanSummaryProps {
  view: CanMonitorView;
}

export const CanSummary = ({ view }: CanSummaryProps) => (
  <View style={styles.summary}>
    <View style={styles.line}>
      <Text style={styles.text}>
        {STRINGS.console.canSummary(view.idCount, Math.round(view.busHz))}
      </Text>
      <Text style={styles.text}>{STRINGS.console.canChangedHint}</Text>
    </View>
    {view.overflow ? (
      <Text style={styles.warning}>{STRINGS.console.canOverflow}</Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  summary: { gap: 4, paddingHorizontal: 2 },
  line: { flexDirection: "row", justifyContent: "space-between" },
  text: { fontSize: 13, color: UiColors.textMuted },
  warning: { fontSize: 13, color: UiColors.warningText },
});
