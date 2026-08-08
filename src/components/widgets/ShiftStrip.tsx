import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors, Radius } from "../../theme";
import { useSignalValue, useSignalsIsLive } from "../../stores/signals.store";

export const SHIFT_SEGMENTS = 16;
export const SHIFT_RPM_MAX = 8000;
const AMBER_FROM = 0.6;
const RED_FROM = 0.85;

export const shiftLitCount = (rpm: number): number => {
  const lit = Math.round((rpm / SHIFT_RPM_MAX) * SHIFT_SEGMENTS);
  return Math.max(0, Math.min(SHIFT_SEGMENTS, lit));
};

export const shiftSegmentColor = (index: number): string => {
  const frac = index / SHIFT_SEGMENTS;
  if (frac >= RED_FROM) return Colors.danger;
  if (frac >= AMBER_FROM) return Colors.warning;
  return Colors.success;
};

const SEGMENT_INDEXES = Array.from({ length: SHIFT_SEGMENTS }, (_, i) => i);

const ShiftStrip = () => {
  const rpm = useSignalValue("r");
  const isLive = useSignalsIsLive();
  const value = isLive && rpm !== undefined ? rpm : 0;
  const lit = shiftLitCount(value);

  return (
    <View
      style={styles.strip}
      accessibilityRole="progressbar"
      accessibilityLabel={`Shift light — ${String(Math.round(value))} rpm`}
    >
      {SEGMENT_INDEXES.map((i) => (
        <View
          key={i}
          style={[
            styles.segment,
            {
              backgroundColor: i < lit ? shiftSegmentColor(i) : Colors.surface2,
            },
          ]}
        />
      ))}
    </View>
  );
};

export default React.memo(ShiftStrip);

const styles = StyleSheet.create({
  strip: { flexDirection: "row", gap: 3, height: 14 },
  segment: { flex: 1, borderRadius: Radius.sm },
});
