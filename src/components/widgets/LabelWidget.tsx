import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  STALE_PLACEHOLDER,
  VALUE_UNIT_FONT_SIZE,
  WIDGET_STALE_TEXT_COLORS,
  WIDGET_TEXT_COLORS,
  WIDGET_TOP_RULE,
  WIDGET_ZONE_COLORS,
  isWarningTripped,
  labelFontSize,
  sensorDefaultDangerThreshold,
  widgetStaleTextColor,
  widgetTextColor,
  widgetTopRulePx,
} from "@canshift/core";
import { Colors, Fonts, Spacing, TabularNums } from "../../theme";
import { SIGNAL_META, type SignalKey } from "../../constants/ble";
import { signalKeyToSensorKind } from "../../theme/signal-colors";
import { toSensorKindValue } from "../../theme/sensor-units";
import { formatWidgetValue } from "./widget-value";

interface LabelWidgetProps {
  signalKey: SignalKey;
  value: number | undefined;
  width: number;
  height: number;
  dayMode?: boolean;
}

const KICKER_SIZE = 10;
const KICKER_TRACKING = KICKER_SIZE * 0.18;

const isInDanger = (key: SignalKey, value: number | undefined): boolean => {
  if (value === undefined) return false;
  const kind = signalKeyToSensorKind(key);
  if (kind === undefined) return false;
  const danger = sensorDefaultDangerThreshold(kind);
  return isWarningTripped(
    toSensorKindValue(key, value),
    danger.threshold,
    danger.invertLogic,
  );
};

const LabelWidget = ({
  signalKey,
  value,
  width,
  height,
  dayMode = false,
}: LabelWidgetProps) => {
  const meta = SIGNAL_META[signalKey];
  const stale = value === undefined;
  const danger = isInDanger(signalKey, value);

  const fontSize = labelFontSize(width, height);
  const text = stale
    ? STALE_PLACEHOLDER
    : formatWidgetValue(value, meta.decimals);

  const ink = danger ? WIDGET_ZONE_COLORS.danger : widgetTextColor(dayMode);
  const tint = stale ? widgetStaleTextColor(dayMode) : ink;
  const kickerColor = danger ? WIDGET_ZONE_COLORS.danger : Colors.textDim;
  const unitColor = dayMode
    ? WIDGET_TEXT_COLORS.day
    : WIDGET_STALE_TEXT_COLORS.day;

  const rulePx = widgetTopRulePx(fontSize);
  const ruleColor = danger
    ? WIDGET_TOP_RULE.dangerColor
    : rulePx === WIDGET_TOP_RULE.primaryPx
      ? widgetTextColor(dayMode)
      : WIDGET_TOP_RULE.trackColor;

  return (
    <View
      style={[
        styles.widget,
        { width, height, borderTopWidth: rulePx, borderTopColor: ruleColor },
      ]}
      accessibilityLabel={`${meta.label} ${stale ? STALE_PLACEHOLDER : String(value)} ${meta.unit}`}
    >
      <Text style={[styles.kicker, { color: kickerColor }]} numberOfLines={1}>
        {meta.label.toUpperCase()}
      </Text>
      <View style={styles.valueRow}>
        <Text
          style={{
            fontSize,
            fontFamily: Fonts.monoBold,
            color: tint,
            fontVariant: TabularNums,
          }}
          numberOfLines={1}
        >
          {text}
        </Text>
        {meta.unit ? (
          <Text
            style={[
              styles.unit,
              {
                fontSize: VALUE_UNIT_FONT_SIZE,
                fontFamily: Fonts.mono,
                color: unitColor,
              },
            ]}
          >
            {meta.unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default React.memo(LabelWidget);

const styles = StyleSheet.create({
  widget: {
    paddingTop: Spacing.xs,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  kicker: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: KICKER_SIZE,
    letterSpacing: KICKER_TRACKING,
    textTransform: "uppercase",
    marginBottom: Spacing.xs,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  unit: {
    marginBottom: 3,
  },
});
