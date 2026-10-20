import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchTarget, UiColors, UiFonts } from "../../theme/ui-tokens";
import type { CanRow } from "../../lib/can-monitor-model";
import { formatByte } from "../../lib/can-hex";
import { formatCanRate } from "../../lib/can-rate";

export const CAN_COLUMN_WIDTH = { id: 84, rate: 56 } as const;

export interface CanFrameRowProps {
  row: CanRow;
}

const CanDataBytes = ({ row }: CanFrameRowProps) => (
  <Text style={styles.data}>
    {row.data.map((byte, index) => (
      <Text
        key={index}
        style={row.changed[index] ? styles.changedByte : styles.byte}
      >
        {`${formatByte(byte)} `}
      </Text>
    ))}
  </Text>
);

export const CanFrameRow = React.memo(({ row }: CanFrameRowProps) => (
  <View style={styles.row}>
    <Text style={styles.id}>{row.idLabel}</Text>
    <CanDataBytes row={row} />
    <Text style={styles.rate}>{formatCanRate(row.rateHz)}</Text>
  </View>
));
CanFrameRow.displayName = "CanFrameRow";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: TouchTarget.min,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: UiColors.borderRow,
  },
  id: {
    width: CAN_COLUMN_WIDTH.id,
    fontFamily: UiFonts.numeric,
    fontSize: 14,
    fontWeight: "700",
    color: UiColors.accent,
  },
  data: { flex: 1, fontFamily: UiFonts.numeric, fontSize: 14 },
  byte: { color: UiColors.labelStale },
  changedByte: { color: UiColors.text },
  rate: {
    width: CAN_COLUMN_WIDTH.rate,
    fontFamily: UiFonts.numeric,
    fontSize: 14,
    textAlign: "right",
    color: UiColors.textSecondary,
  },
});
