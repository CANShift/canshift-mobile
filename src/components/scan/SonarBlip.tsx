import { Animated, Pressable, StyleSheet } from "react-native";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";
import type { ScanResult } from "../../services/ble.service";
import { blipPlacement } from "../../lib/sonar-blips";
import { useBlipPopIn } from "../../hooks/use-blip-pop-in";

export interface SonarBlipProps {
  dash: ScanResult;
  onPress: (dash: ScanResult) => void;
}

const BLIP_SIZE = 14;
const RIPPLE_SCALE = 3.2;
const RIPPLE_OPACITY = 0.7;

const between = (value: Animated.Value, from: number, to: number) =>
  value.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

export const SonarBlip = ({ dash, onPress }: SonarBlipProps) => {
  const { x, y } = blipPlacement(dash.rssi, dash.id);
  const { pop, ripple } = useBlipPopIn();
  return (
    <Pressable
      style={[
        styles.target,
        { left: x - TouchTarget.min / 2, top: y - TouchTarget.min / 2 },
      ]}
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
          {
            opacity: between(ripple, RIPPLE_OPACITY, 0),
            transform: [{ scale: between(ripple, 1, RIPPLE_SCALE) }],
          },
        ]}
      />
      <Animated.View style={[styles.blip, { transform: [{ scale: pop }] }]} />
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
    width: BLIP_SIZE,
    height: BLIP_SIZE,
    borderRadius: BLIP_SIZE / 2,
    backgroundColor: UiColors.text,
  },
  ripple: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: UiColors.text,
  },
});
