import { FlatList, StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import type { CanMonitorView } from "../../hooks/use-can-monitor-view";
import { CanFrameRow, CAN_COLUMN_WIDTH } from "./CanFrameRow";

interface CanFrameListProps {
  view: CanMonitorView;
}

const CanFrameHeader = () => (
  <View style={styles.header}>
    <Text style={[styles.heading, styles.idColumn]}>
      {STRINGS.console.canColumnId}
    </Text>
    <Text style={[styles.heading, styles.dataColumn]}>
      {STRINGS.console.canColumnData}
    </Text>
    <Text style={[styles.heading, styles.rateColumn]}>
      {STRINGS.console.canColumnRate}
    </Text>
  </View>
);

export const CanFrameList = ({ view }: CanFrameListProps) => (
  <View style={styles.card}>
    <CanFrameHeader />
    <FlatList
      data={view.rows}
      keyExtractor={(row) => row.key}
      renderItem={({ item }) => <CanFrameRow row={item} />}
      ListEmptyComponent={
        <Text style={styles.empty}>{STRINGS.console.noMatches}</Text>
      }
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: "hidden",
    borderRadius: UiRadius.tile,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
  },
  header: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: UiColors.border,
  },
  heading: { fontSize: 12, color: UiColors.textMuted },
  idColumn: { width: CAN_COLUMN_WIDTH.id },
  dataColumn: { flex: 1 },
  rateColumn: { width: CAN_COLUMN_WIDTH.rate, textAlign: "right" },
  empty: {
    padding: 16,
    fontSize: 15,
    color: UiColors.textMuted,
    textAlign: "center",
  },
});
