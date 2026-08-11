import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ChevronRight,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { Colors, Typography, Spacing, Fonts } from "../../theme";
import type { ScanResult } from "../../services/ble.service";

const RSSI_STRONG = -60;
const RSSI_FAIR = -75;
const SELECTED_BAR = 3;

interface SignalStrength {
  Icon: LucideIcon;
  color: string;
}

const signalStrength = (rssi: number | null): SignalStrength => {
  if (rssi === null) return { Icon: Signal, color: Colors.textMuted };
  if (rssi >= RSSI_STRONG) return { Icon: SignalHigh, color: Colors.accent };
  if (rssi >= RSSI_FAIR) return { Icon: SignalMedium, color: Colors.textDim };
  return { Icon: SignalLow, color: Colors.textMuted };
};

export interface DeviceRowProps {
  device: ScanResult;
  lastPaired: boolean;
  connecting: boolean;
  disabled: boolean;
  onPress: (device: ScanResult) => void;
}

export const DeviceRow = React.memo(
  ({ device, lastPaired, connecting, disabled, onPress }: DeviceRowProps) => {
    const strength = signalStrength(device.rssi);
    return (
      <TouchableOpacity
        onPress={() => {
          onPress(device);
        }}
        disabled={connecting || disabled}
        accessibilityRole="button"
        accessibilityLabel={`Connect to ${device.name}`}
        accessibilityState={{ disabled: connecting || disabled }}
      >
        <View style={[styles.row, lastPaired && styles.rowSelected]}>
          <strength.Icon size={22} color={strength.color} />
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {device.name}
              </Text>
              {lastPaired && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>LAST PAIRED</Text>
                </View>
              )}
            </View>
            <Text style={styles.meta} numberOfLines={1}>
              {device.rssi === null
                ? device.id
                : `${String(device.rssi)} dBm · ${device.id}`}
            </Text>
          </View>
          {connecting ? (
            <ActivityIndicator color={Colors.accent} size="small" />
          ) : (
            <ChevronRight size={18} color={Colors.textMuted} />
          )}
        </View>
      </TouchableOpacity>
    );
  },
);
DeviceRow.displayName = "DeviceRow";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderLeftWidth: SELECTED_BAR,
    borderLeftColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: Colors.ruleHair,
  },
  rowSelected: {
    backgroundColor: Colors.selectedBg,
    borderLeftColor: Colors.accent,
  },
  info: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  name: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.md,
    color: Colors.text,
    flexShrink: 1,
  },
  meta: {
    fontFamily: Fonts.ui,
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  badge: {
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    color: Colors.accent,
    letterSpacing: 1,
  },
});
