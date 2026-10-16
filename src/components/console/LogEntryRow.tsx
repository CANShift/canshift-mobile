import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { UiColors, UiFonts } from "../../theme/ui-tokens";
import type { LogEntry, LogLevel } from "../../stores/log.store";

const TEXT_SIZE = 13;
const LINE_HEIGHT = TEXT_SIZE * 1.4;

const LEVEL_LOOK: Record<LogLevel, { label: string; color: string }> = {
  info: { label: "INFO", color: UiColors.textMuted },
  warn: { label: "WARN", color: UiColors.warning },
  error: { label: "ERR", color: UiColors.dangerValue },
};

const formatTime = (ms: number): string =>
  new Date(ms).toLocaleTimeString("en-GB", { hour12: false });

export interface LogEntryRowProps {
  entry: LogEntry;
}

export const LogEntryRow = React.memo(({ entry }: LogEntryRowProps) => {
  const look = LEVEL_LOOK[entry.level];
  return (
    <View style={styles.row}>
      <Text style={styles.time}>{formatTime(entry.timestamp)}</Text>
      <Text style={[styles.level, { color: look.color }]}>{look.label}</Text>
      <Text style={styles.message}>{entry.message}</Text>
    </View>
  );
});
LogEntryRow.displayName = "LogEntryRow";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  time: {
    fontFamily: UiFonts.numeric,
    fontSize: TEXT_SIZE,
    lineHeight: LINE_HEIGHT,
    color: UiColors.labelStale,
  },
  level: {
    width: 40,
    fontFamily: UiFonts.numeric,
    fontSize: TEXT_SIZE,
    lineHeight: LINE_HEIGHT,
    fontWeight: "700",
  },
  message: {
    flex: 1,
    fontFamily: UiFonts.numeric,
    fontSize: TEXT_SIZE,
    lineHeight: LINE_HEIGHT,
    color: UiColors.text,
  },
});
