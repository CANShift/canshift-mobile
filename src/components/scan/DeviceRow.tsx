import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors, Fonts } from "../../theme";
import type { ScanResult } from "../../services/ble.service";
import { deviceRowStatus, type DeviceRowState } from "../../lib/device-labels";

const ROW_TEXT_SIZE = 17;
const ROW_PADDING_VERTICAL = 21;

const NAME_COLOR: Record<DeviceRowState, string> = {
  connecting: Colors.text,
  signal: Colors.textMuted,
  unadvertised: Colors.textMuted,
};

const DETAIL_COLOR: Record<DeviceRowState, string> = {
  connecting: Colors.accent,
  signal: Colors.textMuted,
  unadvertised: Colors.textMuted,
};

export interface DeviceRowProps {
  device: ScanResult;
  connecting: boolean;
  disabled: boolean;
  onPress: (device: ScanResult) => void;
}

export const DeviceRow = React.memo(
  ({ device, connecting, disabled, onPress }: DeviceRowProps) => {
    const { state, detail } = deviceRowStatus(device.rssi, connecting);
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          onPress(device);
        }}
        disabled={connecting || disabled}
        accessibilityRole="button"
        accessibilityLabel={`Connect to ${device.name}`}
        accessibilityState={{ disabled: connecting || disabled }}
      >
        <Text
          style={[styles.name, { color: NAME_COLOR[state] }]}
          numberOfLines={1}
        >
          {device.name}
        </Text>
        {detail !== null && (
          <Text style={[styles.detail, { color: DETAIL_COLOR[state] }]}>
            {detail}
          </Text>
        )}
      </TouchableOpacity>
    );
  },
);
DeviceRow.displayName = "DeviceRow";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ROW_PADDING_VERTICAL,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ruleHair,
  },
  name: {
    fontFamily: Fonts.mono,
    fontSize: ROW_TEXT_SIZE,
    flexShrink: 1,
  },
  detail: {
    fontFamily: Fonts.mono,
    fontSize: ROW_TEXT_SIZE,
  },
});
