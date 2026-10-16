import Slider from "@react-native-community/slider";
import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { NO_VALUE } from "../../lib/tile-state";
import {
  BRIGHTNESS_RANGE,
  useDashBrightness,
} from "../../hooks/use-dash-brightness";

export interface BrightnessRowProps {
  enabled: boolean;
}

export const BrightnessRow = ({ enabled }: BrightnessRowProps) => {
  const { brightness, setBrightness, commitBrightness } =
    useDashBrightness(enabled);
  return (
    <View style={styles.row}>
      <View style={styles.heading}>
        <Text style={styles.label}>{STRINGS.live.brightness}</Text>
        <Text style={styles.value}>
          {brightness === null
            ? NO_VALUE
            : `${String(Math.round(brightness))} %`}
        </Text>
      </View>
      <Slider
        disabled={!enabled || brightness === null}
        minimumValue={BRIGHTNESS_RANGE.min}
        maximumValue={BRIGHTNESS_RANGE.max}
        step={BRIGHTNESS_RANGE.step}
        value={brightness ?? BRIGHTNESS_RANGE.max}
        onValueChange={setBrightness}
        onSlidingComplete={(value) => void commitBrightness(value)}
        minimumTrackTintColor={UiColors.primaryBtn}
        maximumTrackTintColor={UiColors.surface2}
        accessibilityLabel={STRINGS.live.brightness}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { gap: 8, minHeight: 56 },
  heading: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 16, color: UiColors.text },
  value: { fontSize: 16, color: UiColors.textMuted },
});
