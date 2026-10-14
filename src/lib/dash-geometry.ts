import { CANVAS, LAYOUT_GRID } from "@canshift/core";
import type { DashValueClass } from "./dash-pages";

export type DashTier = "primary" | "secondary";

export interface DashTierMetrics {
  rulePx: number;
  padTop: number;
  padBottom: number;
  kickerGap: number;
}

export const VALUE_CLASS_DEVICE_PX: Record<DashValueClass, number> = {
  hero: 48,
  heroTrack: 44,
  primary: 32,
  mid: 22,
  secondary: 17,
};

export const VALUE_CLASS_TRACKING: Record<DashValueClass, number> = {
  hero: -0.045,
  heroTrack: -0.045,
  primary: -0.045,
  mid: -0.03,
  secondary: -0.03,
};

export const VALUE_CLASS_TIER: Record<DashValueClass, DashTier> = {
  hero: "primary",
  heroTrack: "primary",
  primary: "primary",
  mid: "secondary",
  secondary: "secondary",
};

export const DASH_TIER_METRICS: Record<DashTier, DashTierMetrics> = {
  primary: { rulePx: 2, padTop: 4, padBottom: 3, kickerGap: 2 },
  secondary: { rulePx: 1, padTop: 3, padBottom: 2, kickerGap: 1 },
};

export const DASH_TYPE = {
  kickerPx: 10,
  kickerTracking: 0.18,
  unitPx: 10,
  padRight: 8,
  barHeightPx: 2,
  barGapPx: 4,
  shiftCellHeightPx: 7,
  shiftCellGapPx: 2,
} as const;

const CONTENT_WIDTH = CANVAS.WIDTH - LAYOUT_GRID.FRAME_PADDING * 2;
const CONTENT_HEIGHT = CANVAS.HEIGHT - LAYOUT_GRID.FRAME_PADDING * 2;

export interface DashArea {
  width: number;
  height: number;
}

export const dashScale = (area: DashArea, fitHeight: boolean): number => {
  const byWidth = Math.max(0, area.width / CONTENT_WIDTH);
  if (!fitHeight) return byWidth;
  return Math.min(byWidth, Math.max(0, area.height / CONTENT_HEIGHT));
};

export const dashGutter = (scale: number): number => LAYOUT_GRID.GUTTER * scale;

export const spanWidth = (span: number, scale: number): number => {
  const gutter = dashGutter(scale);
  const column =
    (CONTENT_WIDTH * scale - gutter * (LAYOUT_GRID.COLUMNS - 1)) /
    LAYOUT_GRID.COLUMNS;
  return Math.floor(column * span + gutter * (span - 1));
};

export const scaledPx = (devicePx: number, scale: number): number =>
  Math.max(1, Math.round(devicePx * scale));
