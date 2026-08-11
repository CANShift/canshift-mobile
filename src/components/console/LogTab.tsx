import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors, Typography, Spacing, Fonts, HitSlop } from "../../theme";
import { useLogStore } from "../../stores/log.store";
import { useLogFilter } from "../../hooks/use-log-filter";
import { LogEntryRow } from "./LogEntryRow";
import { ConsoleEmpty } from "./ConsoleEmpty";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export const LogTab = () => {
  const clear = useLogStore((s) => s.clear);
  const { visible, filter, setFilter, paused, togglePause } = useLogFilter();
  const [confirmVisible, setConfirmVisible] = useState(false);

  return (
    <>
      <View style={styles.controls}>
        <Pressable
          style={[styles.pauseBtn, paused && styles.pauseBtnActive]}
          onPress={togglePause}
          hitSlop={HitSlop.vertical}
          accessibilityRole="button"
          accessibilityLabel={paused ? "Resume log" : "Pause log"}
        >
          <Text style={[styles.pauseText, paused && styles.pauseTextActive]}>
            {paused ? "Paused" : "Live"}
          </Text>
        </Pressable>
        <TextInput
          style={styles.filterInput}
          value={filter}
          onChangeText={setFilter}
          placeholder="Filter…"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Filter log entries"
        />
        <Pressable
          style={styles.clearBtn}
          onPress={() => {
            setConfirmVisible(true);
          }}
          hitSlop={HitSlop.vertical}
          accessibilityRole="button"
          accessibilityLabel="Clear log"
        >
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(e) => e.id}
        contentContainerStyle={
          visible.length === 0 ? styles.empty : styles.list
        }
        renderItem={({ item }) => <LogEntryRow entry={item} />}
        ListEmptyComponent={
          <ConsoleEmpty>
            {filter.trim() ? "No matching events" : "No events yet"}
          </ConsoleEmpty>
        }
      />

      <AlertDialog open={confirmVisible} onOpenChange={setConfirmVisible}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear log?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes all logged events and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onPress={clear}>Clear</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  pauseBtn: {
    minHeight: 40,
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.text,
  },
  pauseBtnActive: { borderColor: Colors.accent },
  pauseText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.text,
  },
  pauseTextActive: { color: Colors.accent },
  filterInput: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontFamily: Fonts.mono,
    fontSize: Typography.sm,
  },
  clearBtn: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
  clearText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.textMuted,
  },
  list: { paddingVertical: Spacing.xs },
  empty: { flex: 1 },
});
