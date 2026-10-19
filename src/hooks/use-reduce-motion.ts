import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export const useReduceMotion = (): boolean => {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    const apply = (enabled: boolean) => {
      if (mounted) setReduceMotion(enabled);
    };
    AccessibilityInfo.isReduceMotionEnabled().then(apply, () => {
      apply(true);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      apply,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  return reduceMotion;
};
