import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { Colors, Typography, Spacing, Fonts } from "../theme";
import { useDeviceStore } from "../stores/device.store";
import { useSignalValue } from "../stores/signals.store";
import { useLinkStatus } from "../hooks/use-link-status";
import { linkLostLabel, type LinkState } from "../lib/link-hold";

const DashTopBar = () => {
  const { deviceName, firmwareVersion, canHealthy, isSim } = useDeviceStore(
    useShallow((s) => ({
      deviceName: s.deviceName,
      firmwareVersion: s.firmwareVersion,
      canHealthy: s.canHealthy,
      isSim: s.mode === "sim",
    })),
  );
  const { state, secondsAgo } = useLinkStatus();
  const mi = useSignalValue("mi");
  const activeMapIndex = mi !== undefined ? Math.round(mi) : undefined;
  const note = HEADER_NOTE[state](secondsAgo);

  return (
    <View style={styles.header}>
      <View style={[styles.topBar, note !== null && styles.topBarTight]}>
        <View>
          <Text style={styles.deviceName}>{deviceName ?? "CANShift"}</Text>
          <View style={styles.versionRow}>
            <Text style={styles.version}>
              {!isSim && firmwareVersion ? `v${firmwareVersion} · ` : "· "}
            </Text>
            <Text
              style={[
                styles.version,
                { color: canHealthy ? Colors.success : Colors.textMuted },
              ]}
            >
              CAN
            </Text>
          </View>
        </View>
        <View style={styles.topBarRight}>
          {activeMapIndex !== undefined && (
            <TopBarBadge
              label={`MAP ${String(activeMapIndex)}`}
              color={Colors.success}
              borderColor={Colors.successBorder}
            />
          )}
          {isSim && (
            <TopBarBadge
              label="SIM"
              color={Colors.accent}
              borderColor={Colors.accent}
            />
          )}
        </View>
      </View>
      {note === null ? null : <Text style={styles.note}>{note}</Text>}
    </View>
  );
};

const HEADER_NOTE: Record<LinkState, (seconds: number) => string | null> = {
  live: () => null,
  waiting: () => "NO DATA",
  lost: (seconds) => linkLostLabel(seconds),
};

const TopBarBadge = ({
  label,
  color,
  borderColor,
}: {
  label: string;
  color: string;
  borderColor: string;
}) => (
  <View style={[styles.badge, { borderColor }]}>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

const HEADER_RULE = 2;
const HEADER_TITLE_SIZE = Typography.xl;
const HEADER_TITLE_TRACKING = HEADER_TITLE_SIZE * -0.02;
const HEADER_META_SIZE = 12;
const HEADER_NOTE_SIZE = 11;
const HEADER_NOTE_GAP = 6;
const HEADER_NOTE_PADDING_BOTTOM = 14;

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: HEADER_RULE,
    borderBottomColor: Colors.border,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  topBarTight: { paddingBottom: 0 },
  note: {
    fontFamily: Fonts.mono,
    fontSize: HEADER_NOTE_SIZE,
    color: Colors.warning,
    paddingHorizontal: Spacing.lg,
    marginTop: HEADER_NOTE_GAP,
    paddingBottom: HEADER_NOTE_PADDING_BOTTOM,
  },
  deviceName: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: HEADER_TITLE_SIZE,
    letterSpacing: HEADER_TITLE_TRACKING,
    color: Colors.text,
  },
  version: {
    fontFamily: Fonts.mono,
    fontSize: HEADER_META_SIZE,
    color: Colors.textMuted,
  },
  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  topBarRight: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  badge: {
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    letterSpacing: 0.8,
  },
});

export default DashTopBar;
