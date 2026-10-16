import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import { useLogStore } from "../../stores/log.store";
import { useLogFilter } from "../../hooks/use-log-filter";
import { ToolButton } from "../buttons/ToolButton";
import { SearchField } from "../controls/SearchField";
import { ConfirmDialog } from "../dialog/ConfirmDialog";
import { Glyph } from "../icons/Glyph";
import { LevelChips } from "./LevelChips";
import { LogEntryRow } from "./LogEntryRow";

export const LogTab = () => {
  const clear = useLogStore((s) => s.clear);
  const log = useLogFilter();
  const [confirming, setConfirming] = useState(false);
  const empty =
    log.filter.trim().length > 0
      ? STRINGS.console.noMatches
      : STRINGS.console.noEvents;
  return (
    <>
      <View style={styles.toolbar}>
        <ToolButton
          label={log.paused ? STRINGS.console.resume : STRINGS.console.pause}
          onPress={log.togglePause}
          icon={
            <Glyph
              name={log.paused ? "play" : "pause"}
              size={16}
              color={UiColors.text}
            />
          }
        />
        <SearchField
          value={log.filter}
          onChange={log.setFilter}
          placeholder={STRINGS.console.filter}
        />
        <ToolButton
          label={STRINGS.console.clear}
          onPress={() => {
            setConfirming(true);
          }}
        />
      </View>
      <LevelChips level={log.level} onLevel={log.setLevel} />
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={log.visible}
        keyExtractor={(entry) => entry.id}
        renderItem={({ item }) => <LogEntryRow entry={item} />}
        ListEmptyComponent={<Text style={styles.empty}>{empty}</Text>}
      />
      <ConfirmDialog
        visible={confirming}
        title={STRINGS.console.clearTitle}
        body={STRINGS.console.clearBody}
        confirmLabel={STRINGS.console.clear}
        cancelLabel={STRINGS.console.cancel}
        onConfirm={() => {
          clear();
          setConfirming(false);
        }}
        onCancel={() => {
          setConfirming(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  toolbar: { flexDirection: "row", gap: 8 },
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
