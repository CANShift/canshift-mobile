import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import { Button, SegmentedControl } from "../components/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Colors, Typography, Spacing, Fonts, HitSlop } from "../theme";
import {
  useLogStore,
  log,
  type LogEntry,
  type LogLevel,
} from "../stores/log.store";
import { useDeviceStore } from "../stores/device.store";
import { sendCmd } from "../services/ble.service";
import { errText } from "../lib/error-text";

type ConsoleTab = "can" | "log" | "send";

const TABS: { value: ConsoleTab; label: string }[] = [
  { value: "can", label: "CAN" },
  { value: "log", label: "Log" },
  { value: "send", label: "Send" },
];

const LEVEL_COLOR: Record<LogLevel, string> = {
  info: Colors.textDim,
  warn: Colors.warning,
  error: Colors.danger,
};

const CONSOLE_TEXT_SIZE = 12;
const CONSOLE_LINE_HEIGHT = CONSOLE_TEXT_SIZE * 2.1;

const formatTime = (ms: number): string =>
  new Date(ms).toLocaleTimeString("en-US", { hour12: false });

const LogEntryRow = React.memo(function LogEntryRow({
  entry,
}: {
  entry: LogEntry;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.timestamp}>{formatTime(entry.timestamp)}</Text>
      <Text style={[styles.level, { color: LEVEL_COLOR[entry.level] }]}>
        {entry.level.toUpperCase()}
      </Text>
      <Text style={styles.message} numberOfLines={3}>
        {entry.message}
      </Text>
    </View>
  );
});

const LogTab = () => {
  const entries = useLogStore((s) => s.entries);
  const clear = useLogStore((s) => s.clear);
  const [pausedSnapshot, setPausedSnapshot] = useState<LogEntry[] | null>(null);
  const [filter, setFilter] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);

  const paused = pausedSnapshot !== null;
  const source = pausedSnapshot ?? entries;

  const visible = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return source;
    return source.filter(
      (e) => e.message.toLowerCase().includes(query) || e.level.includes(query),
    );
  }, [source, filter]);

  const togglePause = useCallback(() => {
    setPausedSnapshot((current) => (current === null ? [...entries] : null));
  }, [entries]);

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
          visible.length === 0 ? styles.emptyContainer : styles.list
        }
        renderItem={({ item }) => <LogEntryRow entry={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {filter.trim() ? "No matching events" : "No events yet"}
          </Text>
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

const SendTab = () => {
  const { mode, connectionState } = useDeviceStore(
    useShallow((s) => ({
      mode: s.mode,
      connectionState: s.connectionState,
    })),
  );
  const [command, setCommand] = useState("");
  const [sending, setSending] = useState(false);
  const canSend = mode === "ble" && connectionState === "connected";

  const handleSend = useCallback(async () => {
    const trimmed = command.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await sendCmd(trimmed);
      log("info", `Console → sent "${trimmed}"`);
      setCommand("");
    } catch (err) {
      Alert.alert("Send failed", errText(err));
    } finally {
      setSending(false);
    }
  }, [command, sending]);

  if (!canSend) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {mode === "sim"
            ? "Command send isn't available in demo mode."
            : "Connect to a dashboard over Bluetooth to send commands."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.sendBody}>
      <Text style={styles.sendLabel}>Command</Text>
      <TextInput
        style={styles.sendInput}
        value={command}
        onChangeText={setCommand}
        placeholder="e.g. reset_odo"
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={() => void handleSend()}
        returnKeyType="send"
        accessibilityLabel="Command to send"
      />
      <Button
        onPress={() => void handleSend()}
        disabled={!command.trim() || sending}
        accessibilityLabel="Send command"
      >
        {sending ? "Sending…" : "Send"}
      </Button>
    </View>
  );
};

const CanTab = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyTitle}>No CAN stream</Text>
    <Text style={styles.emptyText}>
      Raw CAN frames aren't streamed to the companion app yet — the dashboard
      sends telemetry, status and timer channels over Bluetooth, not the raw
      bus.
    </Text>
  </View>
);

export default function LogScreen() {
  const [tab, setTab] = useState<ConsoleTab>("log");

  return (
    <SafeAreaView style={styles.container}>
      <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      {tab === "log" && <LogTab />}
      {tab === "send" && <SendTab />}
      {tab === "can" && <CanTab />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.xs,
  },
  emptyTitle: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.md,
    color: Colors.text,
  },
  emptyText: {
    fontFamily: Fonts.ui,
    color: Colors.textMuted,
    fontSize: Typography.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ruleHair,
    gap: Spacing.sm,
  },
  timestamp: {
    fontFamily: Fonts.mono,
    fontSize: CONSOLE_TEXT_SIZE,
    lineHeight: CONSOLE_LINE_HEIGHT,
    color: Colors.textMuted,
    minWidth: 66,
    flexShrink: 0,
    fontVariant: ["tabular-nums"],
  },
  level: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    lineHeight: CONSOLE_LINE_HEIGHT,
    letterSpacing: 0.6,
    minWidth: 38,
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontFamily: Fonts.mono,
    fontSize: CONSOLE_TEXT_SIZE,
    lineHeight: CONSOLE_LINE_HEIGHT,
    color: Colors.textDim,
  },

  sendBody: { padding: Spacing.lg, gap: Spacing.sm },
  sendLabel: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.textMuted,
  },
  sendInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontFamily: Fonts.mono,
    fontSize: Typography.md,
  },
});
