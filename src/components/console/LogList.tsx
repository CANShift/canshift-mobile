import { FlatList, StyleSheet, Text } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import type { LogFilter } from "../../hooks/use-log-filter";
import { LogEntryRow } from "./LogEntryRow";

interface LogListProps {
  log: LogFilter;
}

export const LogList = ({ log }: LogListProps) => {
  const empty =
    log.filter.trim().length > 0
      ? STRINGS.console.noMatches
      : STRINGS.console.noEvents;
  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={log.visible}
      keyExtractor={(entry) => entry.id}
      renderItem={({ item }) => <LogEntryRow entry={item} />}
      ListEmptyComponent={<Text style={styles.empty}>{empty}</Text>}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    borderRadius: UiRadius.tile,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
  },
  listContent: { paddingVertical: 6 },
  empty: {
    padding: 16,
    fontSize: 15,
    color: UiColors.textMuted,
    textAlign: "center",
  },
});
