import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Typography, Spacing } from "../../theme";
import type { LogEntry, LogLevel } from "../../stores/log.store";

export const CONSOLE_TEXT_SIZE = 12;
export const CONSOLE_LINE_HEIGHT = CONSOLE_TEXT_SIZE * 2.1;

const LEVEL_COLOR: Record<LogLevel, string> = {
  info: Colors.textDim,
  warn: Colors.warning,
  error: Colors.danger,
};

const formatTime = (ms: number): string =>
  new Date(ms).toLocaleTimeString("en-US", { hour12: false });

export const LogEntryRow = React.memo(function LogEntryRow({
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

const styles = StyleSheet.create({
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
});
