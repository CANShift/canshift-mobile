import React from "react";
import { View } from "react-native";
import { useSignalValue, useSignalsIsLive } from "../../stores/signals.store";
import { DASH_TYPE, scaledPx } from "../../lib/dash-geometry";
import type { DashPalette } from "../../lib/dash-palette";
import {
  SHIFT_CELL_INDEXES,
  isRedShiftCell,
  shiftLitCount,
} from "../../lib/dash-shift-light";

export interface DashShiftLightProps {
  scale: number;
  palette: DashPalette;
}

const cellColor = (
  index: number,
  lit: number,
  palette: DashPalette,
): string => {
  if (index >= lit) return palette.track;
  return isRedShiftCell(index) ? palette.danger : palette.ink;
};

const DashShiftLight = ({ scale, palette }: DashShiftLightProps) => {
  const rpm = useSignalValue("r");
  const isLive = useSignalsIsLive();
  const shownRpm = isLive && rpm !== undefined ? rpm : 0;
  const lit = shiftLitCount(shownRpm);

  return (
    <View
      style={{
        flexDirection: "row",
        gap: scaledPx(DASH_TYPE.shiftCellGapPx, scale),
      }}
      accessibilityRole="progressbar"
      accessibilityLabel={`Shift light — ${String(Math.round(shownRpm))} rpm`}
    >
      {SHIFT_CELL_INDEXES.map((index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height: scaledPx(DASH_TYPE.shiftCellHeightPx, scale),
            backgroundColor: cellColor(index, lit, palette),
          }}
        />
      ))}
    </View>
  );
};

export default React.memo(DashShiftLight);
