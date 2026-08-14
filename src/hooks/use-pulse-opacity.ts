import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

export const usePulseOpacity = (
  active: boolean,
  minOpacity: number,
  halfPeriodMs: number,
): Animated.Value => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) return;
    opacity.setValue(1);
    const step = (toValue: number) =>
      Animated.timing(opacity, {
        toValue,
        duration: halfPeriodMs,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      });
    const loop = Animated.loop(Animated.sequence([step(minOpacity), step(1)]));
    loop.start();
    return () => {
      loop.stop();
    };
  }, [active, minOpacity, halfPeriodMs, opacity]);

  return opacity;
};
