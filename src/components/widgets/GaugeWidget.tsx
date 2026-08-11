import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  GAUGE_ARC,
  GAUGE_TRACK_COLORS,
  STALE_PLACEHOLDER,
  VALUE_UNIT_FONT_SIZE,
  WIDGET_STALE_TEXT_COLORS,
  WIDGET_TEXT_COLORS,
  WIDGET_ZONE_COLORS,
  gaugeArcStrokeWidth,
  gaugeValueAngle,
  gaugeValueFontSize,
  isWarningTripped,
  sensorDefaultDangerThreshold,
  sensorDefaultRange,
  widgetFracFontSize,
  widgetStaleTextColor,
  widgetTextColor,
} from "@canshift/core";
import { Fonts, TabularNums } from "../../theme";
import { SIGNAL_META, type SignalKey } from "../../constants/ble";
import { signalKeyToSensorKind } from "../../theme/signal-colors";
import { formatWidgetValue, splitWidgetValue } from "./widget-value";

interface GaugeWidgetProps {
  signalKey: SignalKey;
  value: number | undefined;
  size: number;
  dayMode?: boolean;
}

const DEGREES_TO_RADIANS = Math.PI / 180;
const HALF_CIRCLE_DEG = 180;

const polarPoint = (
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): [number, number] => {
  const rad = angleDeg * DEGREES_TO_RADIANS;
  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
};

const fmt = (n: number): string => n.toFixed(3);

const arcPath = (
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
): string => {
  const [x0, y0] = polarPoint(cx, cy, radius, startDeg);
  const [x1, y1] = polarPoint(cx, cy, radius, endDeg);
  const largeArc = endDeg - startDeg > HALF_CIRCLE_DEG ? "1" : "0";
  return `M ${fmt(x0)} ${fmt(y0)} A ${fmt(radius)} ${fmt(radius)} 0 ${largeArc} 1 ${fmt(x1)} ${fmt(y1)}`;
};

const GaugeWidget = ({
  signalKey,
  value,
  size,
  dayMode = false,
}: GaugeWidgetProps) => {
  const meta = SIGNAL_META[signalKey];
  const kind = signalKeyToSensorKind(signalKey);
  const stale = value === undefined;

  const intFontSize = gaugeValueFontSize(size);
  const fracFontSize = widgetFracFontSize(intFontSize);

  const unitColor = dayMode
    ? WIDGET_TEXT_COLORS.day
    : WIDGET_STALE_TEXT_COLORS.day;

  if (!kind) {
    const parts = stale
      ? { int: STALE_PLACEHOLDER, frac: "" }
      : splitWidgetValue(formatWidgetValue(value, meta.decimals), false);
    const color = stale
      ? widgetStaleTextColor(dayMode)
      : widgetTextColor(dayMode);
    return (
      <View
        style={[styles.container, { width: size, height: size }]}
        accessibilityLabel={`${meta.label} ${stale ? STALE_PLACEHOLDER : String(value)} ${meta.unit}`}
      >
        <ValueCluster
          intText={parts.int}
          fracText={parts.frac}
          unit={meta.unit}
          color={color}
          unitColor={unitColor}
          intFontSize={intFontSize}
          fracFontSize={fracFontSize}
        />
      </View>
    );
  }

  const range = sensorDefaultRange(kind);
  const fillAngle = stale ? 0 : gaugeValueAngle(value, range.min, range.max);

  const stroke = gaugeArcStrokeWidth(size, size);
  const diameter = Math.max(
    size - stroke - GAUGE_ARC.containerPadding,
    GAUGE_ARC.minDiameter,
  );
  const radius = diameter / 2;
  const cx = size / 2;
  const cy = size / 2 + GAUGE_ARC.yShift;

  const startDeg = GAUGE_ARC.rotationDeg;
  const trackPath = arcPath(
    cx,
    cy,
    radius,
    startDeg,
    startDeg + GAUGE_ARC.sweepDeg,
  );
  const danger = sensorDefaultDangerThreshold(kind);
  const inDanger =
    !stale && isWarningTripped(value, danger.threshold, danger.invertLogic);
  const fillColor = inDanger
    ? WIDGET_ZONE_COLORS.danger
    : widgetTextColor(dayMode);

  const parts = stale
    ? { int: STALE_PLACEHOLDER, frac: "" }
    : splitWidgetValue(formatWidgetValue(value, meta.decimals), false);
  const valueColor = stale ? widgetStaleTextColor(dayMode) : fillColor;

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityLabel={`${meta.label} ${stale ? STALE_PLACEHOLDER : String(value)} ${meta.unit}`}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Path
          d={trackPath}
          stroke={GAUGE_TRACK_COLORS.plain}
          strokeWidth={stroke}
          strokeLinecap="butt"
          fill="none"
        />
        {fillAngle > 0 ? (
          <Path
            d={arcPath(cx, cy, radius, startDeg, startDeg + fillAngle)}
            stroke={fillColor}
            strokeWidth={stroke}
            strokeLinecap="butt"
            fill="none"
          />
        ) : null}
      </Svg>
      <View
        style={[
          styles.overlay,
          {
            maxWidth: diameter - stroke * 2,
            transform: [{ translateY: GAUGE_ARC.yShift }],
          },
        ]}
      >
        <ValueCluster
          intText={parts.int}
          fracText={parts.frac}
          unit={meta.unit}
          color={valueColor}
          unitColor={unitColor}
          intFontSize={intFontSize}
          fracFontSize={fracFontSize}
        />
      </View>
    </View>
  );
};

interface ValueClusterProps {
  intText: string;
  fracText: string;
  unit: string;
  color: string;
  unitColor: string;
  intFontSize: number;
  fracFontSize: number;
}

const ValueCluster = ({
  intText,
  fracText,
  unit,
  color,
  unitColor,
  intFontSize,
  fracFontSize,
}: ValueClusterProps) => (
  <>
    <View style={styles.valueRow}>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={{
          fontSize: intFontSize,
          fontFamily: Fonts.monoBold,
          color,
          fontVariant: TabularNums,
        }}
      >
        {intText}
      </Text>
      {fracText ? (
        <Text
          style={{
            fontSize: fracFontSize,
            fontFamily: Fonts.monoBold,
            color,
            fontVariant: TabularNums,
          }}
        >
          {fracText}
        </Text>
      ) : null}
    </View>
    {unit ? (
      <Text
        style={{
          fontSize: VALUE_UNIT_FONT_SIZE,
          fontFamily: Fonts.mono,
          color: unitColor,
        }}
      >
        {unit}
      </Text>
    ) : null}
  </>
);

export default React.memo(GaugeWidget);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    alignItems: "center",
    justifyContent: "center",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
});
