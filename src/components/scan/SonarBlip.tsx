import { Animated, Pressable, StyleSheet } from "react-native";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";
import type { ScanResult } from "../../services/ble.service";
import { blipPlacement } from "../../lib/sonar-blips";
import { useBlipPopIn } from "../../hooks/use-blip-pop-in";

export interface SonarBlipProps {
  dash: ScanResult;
  scale: number;
  onPress: (dash: ScanResult) => void;
}

const BLIP_SIZE = 14;
const MIN_BLIP_SIZE = 9;
const RIPPLE_SCALE = 3.2;
const RIPPLE_OPACITY = 0.7;

const between = (value: Animated.Value, from: number, to: number) =>
  value.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

const targetFrame = (dash: ScanResult, scale: number) => {
  const { x, y } = blipPlacement(dash.rssi, dash.id);
  return {
    left: x * scale - TouchTarget.min / 2,
    top: y * scale - TouchTarget.min / 2,
  };
};

const blipFrame = (scale: number) => {
  const size = Math.max(MIN_BLIP_SIZE, BLIP_SIZE * scale);
  return { width: size, height: size, borderRadius: size / 2 };
};

export const SonarBlip = ({ dash, scale, onPress }: SonarBlipProps) => {
  const { pop, ripple } = useBlipPopIn();
  const frame = blipFrame(scale);
  return (
    <Pressable
      style={[styles.target, targetFrame(dash, scale)]}
      onPress={() => {
        onPress(dash);
      }}
      accessibilityRole="button"
      accessibilityLabel={dash.name}
    >
      <Animated.View
        style={[
          styles.blip,
          styles.ripple,
          frame,
          {
            opacity: between(ripple, RIPPLE_OPACITY, 0),
            transform: [{ scale: between(ripple, 1, RIPPLE_SCALE) }],
          },
        ]}
      />
      <Animated.View
        style={[styles.blip, frame, { transform: [{ scale: pop }] }]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  target: {
    position: "absolute",
    width: TouchTarget.min,
    height: TouchTarget.min,
    alignItems: "center",
    justifyContent: "center",
  },
  blip: {
    position: "absolute",
    backgroundColor: UiColors.text,
  },
  ripple: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: UiColors.text,
  },
});
