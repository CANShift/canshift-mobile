import { Animated, StyleSheet, View } from "react-native";
import { UiColors } from "../../theme/ui-tokens";
import {
  pulseReach,
  ringFrame,
  type SonarRingSpec,
} from "../../lib/sonar-geometry";

export interface SonarRingProps {
  ring: SonarRingSpec;
  pulse: Animated.Value;
}

const GLOW_LEAD = 0.14;
const GLOW_TAIL = 0.15;
const GLOW_WIDTH = 2;

const ringGlow = (pulse: Animated.Value, ring: SonarRingSpec) => {
  const reach = pulseReach(ring);
  return pulse.interpolate({
    inputRange: [reach - GLOW_LEAD, reach, Math.min(reach + GLOW_TAIL, 1)],
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });
};

export const SonarRing = ({ ring, pulse }: SonarRingProps) => (
  <>
    <View
      style={[
        styles.ring,
        ringFrame(ring),
        { borderColor: ring.color, borderWidth: ring.width },
      ]}
    />
    <Animated.View
      style={[
        styles.ring,
        styles.glow,
        ringFrame(ring),
        { opacity: ringGlow(pulse, ring) },
      ]}
    />
  </>
);

const styles = StyleSheet.create({
  ring: { position: "absolute" },
  glow: { borderColor: UiColors.accent, borderWidth: GLOW_WIDTH },
});
