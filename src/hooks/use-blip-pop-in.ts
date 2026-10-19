import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { useReduceMotion } from "./use-reduce-motion";

export interface BlipPopIn {
  pop: Animated.Value;
  ripple: Animated.Value;
}

const RIPPLE_MS = 900;
const POP_FRICTION = 5;
const POP_TENSION = 140;
const RIPPLE_EASING = Easing.bezier(0.5, 1, 0.89, 1);

const popInAnimation = ({ pop, ripple }: BlipPopIn) =>
  Animated.parallel([
    Animated.spring(pop, {
      toValue: 1,
      friction: POP_FRICTION,
      tension: POP_TENSION,
      useNativeDriver: true,
    }),
    Animated.timing(ripple, {
      toValue: 1,
      duration: RIPPLE_MS,
      easing: RIPPLE_EASING,
      useNativeDriver: true,
    }),
  ]);

export const useBlipPopIn = (): BlipPopIn => {
  const reduceMotion = useReduceMotion();
  const pop = useRef(new Animated.Value(0)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduceMotion) {
      pop.setValue(1);
      ripple.setValue(1);
      return undefined;
    }
    const animation = popInAnimation({ pop, ripple });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [reduceMotion, pop, ripple]);
  return { pop, ripple };
};
