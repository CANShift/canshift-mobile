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
          <View style={styles.mapBadge}>
            <Text style={styles.mapText}>MAP {activeMapIndex}</Text>
          </View>
        )}
        {isSim && (
          <View style={styles.simBadge}>
            <Text style={styles.simText}>SIM</Text>
          </View>
        )}
        {!isLive && !isSim && (
          <View style={styles.staleBadge}>
            <Text style={styles.staleText}>NO DATA</Text>
          </View>
        )}
      </View>
    </View>
  );
}

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
  mapBadge: {
    borderWidth: 1,
    borderColor: Colors.successBorder,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  mapText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    color: Colors.success,
    letterSpacing: 0.8,
  },
  simBadge: {
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  simText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    color: Colors.accent,
    letterSpacing: 0.8,
  },
  staleBadge: {
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  staleText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    color: Colors.accent,
    letterSpacing: 0.8,
  },
});
