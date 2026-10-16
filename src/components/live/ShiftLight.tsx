import React from "react";
import { StyleSheet, View } from "react-native";
import { UiColors } from "../../theme/ui-tokens";
import {
  SHIFT_CELL_INDEXES,
  shiftCellZone,
  shiftLitCount,
  type ShiftZone,
} from "../../lib/dash-shift-light";

const ZONE_COLORS: Record<ShiftZone, string> = {
  green: UiColors.success,
  orange: UiColors.warning,
  red: UiColors.accent,
};

export interface ShiftLightProps {
  rpm: number | null;
  height: number;
}

const cellColor = (index: number, lit: number): string =>
  index < lit ? ZONE_COLORS[shiftCellZone(index)] : UiColors.surface2;

const ShiftLight = ({ rpm, height }: ShiftLightProps) => {
  const lit = rpm === null ? 0 : shiftLitCount(rpm);
  return (
    <View
      style={[styles.bar, { height }]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Shift light, ${String(lit)} of ${String(SHIFT_CELL_INDEXES.length)}`}
    >
      {SHIFT_CELL_INDEXES.map((index) => (
        <View
          key={index}
          style={[styles.cell, { backgroundColor: cellColor(index, lit) }]}
        />
      ))}
    </View>
  );
};

export default React.memo(ShiftLight);

const styles = StyleSheet.create({
  bar: { flexDirection: "row", gap: 4 },
  cell: { flex: 1, borderRadius: 3 },
});
