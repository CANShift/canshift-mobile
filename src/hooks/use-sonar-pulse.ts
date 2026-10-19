import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { useReduceMotion } from "./use-reduce-motion";

export type SonarMode = "idle" | "sweep" | "calm";

export interface SonarAnimation {
  mode: SonarMode;
  pulse: Animated.Value;
  breath: Animated.Value;
}

interface SonarValues {
  pulse: Animated.Value;
  breath: Animated.Value;
}

const PULSE_PERIOD_MS = 1600;
const CALM_BREATH_PERIOD_MS = 3200;
const SINE_IN_OUT = Easing.bezier(0.37, 0, 0.63, 1);
const QUAD_OUT = Easing.bezier(0.5, 1, 0.89, 1);

const timing = (value: Animated.Value, toValue: number, duration: number) =>
  Animated.timing(value, {
    toValue,
    duration,
    easing: SINE_IN_OUT,
    useNativeDriver: true,
  });

const breathLoop = (breath: Animated.Value, periodMs: number) =>
  Animated.loop(
    Animated.sequence([
      timing(breath, 1, periodMs / 2),
      timing(breath, 0, periodMs / 2),
    ]),
  );

const sweepLoop = ({ pulse, breath }: SonarValues) =>
  Animated.parallel([
    Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: PULSE_PERIOD_MS,
        easing: QUAD_OUT,
        useNativeDriver: true,
      }),
    ),
    breathLoop(breath, PULSE_PERIOD_MS),
  ]);

const SONAR_LOOPS: Record<
  SonarMode,
  (values: SonarValues) => Animated.CompositeAnimation | null
> = {
  idle: () => null,
  sweep: sweepLoop,
  calm: ({ breath }) => breathLoop(breath, CALM_BREATH_PERIOD_MS),
};

const sonarMode = (active: boolean, reduceMotion: boolean): SonarMode => {
  if (!active) return "idle";
  return reduceMotion ? "calm" : "sweep";
};

export const useSonarPulse = (active: boolean): SonarAnimation => {
  const mode = sonarMode(active, useReduceMotion());
  const pulse = useRef(new Animated.Value(0)).current;
  const breath = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = SONAR_LOOPS[mode]({ pulse, breath });
    loop?.start();
    return () => {
      loop?.stop();
      pulse.setValue(0);
      breath.setValue(0);
    };
  }, [mode, pulse, breath]);
  return { mode, pulse, breath };
};
