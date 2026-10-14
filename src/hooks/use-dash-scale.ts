import { useCallback, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { SCREEN_PADDING } from "../theme";
import { dashScale, type DashArea } from "../lib/dash-geometry";

export interface DashScale {
  scale: number;
  onLayout: (event: LayoutChangeEvent) => void;
}

const UNMEASURED: DashArea = { width: 0, height: 0 };

export const useDashScale = (): DashScale => {
  const [area, setArea] = useState<DashArea>(UNMEASURED);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setArea({ width, height });
  }, []);
  const content = {
    width: area.width - SCREEN_PADDING * 2,
    height: area.height,
  };
  const isLandscape = area.width > area.height;
  const scale = dashScale(content, isLandscape);
  return { scale, onLayout };
};
