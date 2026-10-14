import React from "react";
import {
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Fonts, TabularNums } from "../../theme";
import { useSignalValue, useSignalsIsLive } from "../../stores/signals.store";
import type { DashWidgetSpec } from "../../lib/dash-pages";
import { dashReading } from "../../lib/dash-reading";
import {
  dashToneColors,
  type DashPalette,
  type DashToneColors,
} from "../../lib/dash-palette";
import {
  DASH_TIER_METRICS,
  DASH_TYPE,
  VALUE_CLASS_DEVICE_PX,
  VALUE_CLASS_TIER,
  VALUE_CLASS_TRACKING,
  scaledPx,
  spanWidth,
} from "../../lib/dash-geometry";
import { DashBar } from "./DashBar";

export interface DashValueWidgetProps {
  spec: DashWidgetSpec;
  scale: number;
  palette: DashPalette;
}

const boxStyle = (
  spec: DashWidgetSpec,
  scale: number,
  rule: string,
): ViewStyle => {
  const metrics = DASH_TIER_METRICS[VALUE_CLASS_TIER[spec.valueClass]];
  return {
    width: spanWidth(spec.span, scale),
    borderTopWidth: scaledPx(metrics.rulePx, scale),
    borderTopColor: rule,
    paddingTop: scaledPx(metrics.padTop, scale),
    paddingBottom: scaledPx(metrics.padBottom, scale),
    paddingRight: scaledPx(DASH_TYPE.padRight, scale),
    gap: scaledPx(metrics.kickerGap, scale),
  };
};

const kickerStyle = (scale: number, colors: DashToneColors): TextStyle => {
  const size = scaledPx(DASH_TYPE.kickerPx, scale);
  return {
    fontSize: size,
    letterSpacing: size * DASH_TYPE.kickerTracking,
    color: colors.kicker,
  };
};

const valueStyle = (
  spec: DashWidgetSpec,
  scale: number,
  colors: DashToneColors,
): TextStyle => {
  const size = scaledPx(VALUE_CLASS_DEVICE_PX[spec.valueClass], scale);
  return {
    fontSize: size,
    letterSpacing: size * VALUE_CLASS_TRACKING[spec.valueClass],
    color: colors.value,
  };
};

const DashValueWidget = ({ spec, scale, palette }: DashValueWidgetProps) => {
  const value = useSignalValue(spec.signal);
  const isLive = useSignalsIsLive();
  const reading = dashReading(spec.signal, value, isLive);
  const tier = VALUE_CLASS_TIER[spec.valueClass];
  const colors = dashToneColors(palette, tier, reading.tone);
  const unitStyle = {
    fontSize: scaledPx(DASH_TYPE.unitPx, scale),
    color: palette.dim,
  };

  return (
    <View
      style={boxStyle(spec, scale, colors.rule)}
      accessibilityLabel={`${spec.kicker} ${reading.text}`}
    >
      <Text
        style={[styles.kicker, kickerStyle(scale, colors)]}
        numberOfLines={1}
      >
        {spec.kicker}
      </Text>
      <View style={styles.valueRow}>
        <Text
          style={[styles.value, valueStyle(spec, scale, colors)]}
          numberOfLines={1}
        >
          {reading.text}
        </Text>
        {spec.unit === undefined ? null : (
          <Text style={[styles.unit, unitStyle]}>{` ${spec.unit}`}</Text>
        )}
      </View>
      {spec.bar === true && (
        <DashBar
          fraction={reading.barFraction}
          scale={scale}
          fill={colors.bar}
          track={palette.track}
        />
      )}
    </View>
  );
};

export default React.memo(DashValueWidget);

const styles = StyleSheet.create({
  kicker: { fontFamily: Fonts.uiExtraBold, textTransform: "uppercase" },
  valueRow: { flexDirection: "row", alignItems: "baseline" },
  value: { fontFamily: Fonts.monoBold, fontVariant: TabularNums },
  unit: { fontFamily: Fonts.mono },
});
