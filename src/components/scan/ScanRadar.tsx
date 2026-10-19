import { Animated, StyleSheet, View, type ViewStyle } from "react-native";
import { UiColors } from "../../theme/ui-tokens";
import { useSonarPulse, type SonarMode } from "../../hooks/use-sonar-pulse";
import {
  DOT_SIZE,
  PULSE_SIZE,
  RADAR_SIZE,
  SONAR_RINGS,
  centeredSquare,
} from "../../lib/sonar-geometry";
import { SonarRing } from "./SonarRing";

export interface ScanRadarProps {
  active: boolean;
}

type AnimatedStyle = Animated.WithAnimatedValue<ViewStyle>;

const PULSE_WIDTH = 2;
const PULSE_PEAK_OPACITY = 0.8;
const PULSE_FADE_IN = 0.04;
const BREATH_MIN_OPACITY = 0.7;
const BREATH_MAX_SCALE = 1.15;

const between = (value: Animated.Value, from: number, to: number) =>
  value.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

const pulseStyle = (pulse: Animated.Value): AnimatedStyle => ({
  opacity: pulse.interpolate({
    inputRange: [0, PULSE_FADE_IN, 1],
    outputRange: [0, PULSE_PEAK_OPACITY, 0],
  }),
  transform: [{ scale: between(pulse, DOT_SIZE / PULSE_SIZE, 1) }],
});

const DOT_STYLES: Record<SonarMode, (breath: Animated.Value) => AnimatedStyle> =
  {
    idle: () => ({}),
    calm: (breath) => ({ opacity: between(breath, 1, BREATH_MIN_OPACITY) }),
    sweep: (breath) => ({
      opacity: between(breath, 1, BREATH_MIN_OPACITY),
      transform: [{ scale: between(breath, 1, BREATH_MAX_SCALE) }],
    }),
  };

export const ScanRadar = ({ active }: ScanRadarProps) => {
  const { mode, pulse, breath } = useSonarPulse(active);
  return (
    <View
      style={styles.radar}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {SONAR_RINGS.map((ring) => (
        <SonarRing key={ring.inset} ring={ring} pulse={pulse} />
      ))}
      <Animated.View style={[styles.pulse, pulseStyle(pulse)]} />
      <Animated.View style={[styles.dot, DOT_STYLES[mode](breath)]} />
    </View>
  );
};

const styles = StyleSheet.create({
  radar: {
    alignSelf: "center",
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    marginTop: 16,
  },
  pulse: {
    ...centeredSquare(PULSE_SIZE),
    borderWidth: PULSE_WIDTH,
    borderColor: UiColors.accent,
  },
  dot: { ...centeredSquare(DOT_SIZE), backgroundColor: UiColors.accent },
});
