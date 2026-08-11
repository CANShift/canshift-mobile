import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { Colors, Typography, Spacing, Fonts } from "../theme";
import { useDeviceStore } from "../stores/device.store";
import { useSignalValue, useSignalsIsLive } from "../stores/signals.store";

export default function DashTopBar() {
  const { deviceName, firmwareVersion, canHealthy, isSim } = useDeviceStore(
    useShallow((s) => ({
      deviceName: s.deviceName,
      firmwareVersion: s.firmwareVersion,
      canHealthy: s.canHealthy,
      isSim: s.mode === "sim",
    })),
  );
  const isLive = useSignalsIsLive();
  const mi = useSignalValue("mi");
  const activeMapIndex = mi !== undefined ? Math.round(mi) : undefined;

  return (
    <View style={styles.topBar}>
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
        {!isLive && !isSim && (
          <TopBarBadge
            label="NO DATA"
            color={Colors.accent}
            borderColor={Colors.accent}
          />
        )}
      </View>
    </View>
  );
}

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

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: HEADER_RULE,
    borderBottomColor: Colors.border,
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
