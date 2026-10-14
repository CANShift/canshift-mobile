import {
  WIDGET_ZONE_COLORS,
  widgetDimColor,
  widgetGroundColor,
  widgetTextColor,
  widgetTrackColor,
} from "@canshift/core";
import type { DashTier } from "./dash-geometry";
import type { DashTone } from "./dash-reading";

export interface DashPalette {
  ground: string;
  ink: string;
  dim: string;
  track: string;
  danger: string;
}

export interface DashToneColors {
  rule: string;
  kicker: string;
  value: string;
  bar: string;
}

export const dashPalette = (dayMode: boolean): DashPalette => ({
  ground: widgetGroundColor(dayMode),
  ink: widgetTextColor(dayMode),
  dim: widgetDimColor(dayMode),
  track: widgetTrackColor(dayMode),
  danger: WIDGET_ZONE_COLORS.danger,
});

const tierRule = (palette: DashPalette, tier: DashTier): string =>
  tier === "primary" ? palette.ink : palette.track;

export const dashToneColors = (
  palette: DashPalette,
  tier: DashTier,
  tone: DashTone,
): DashToneColors => {
  const byTone: Record<DashTone, DashToneColors> = {
    normal: {
      rule: tierRule(palette, tier),
      kicker: palette.dim,
      value: palette.ink,
      bar: palette.ink,
    },
    danger: {
      rule: palette.danger,
      kicker: palette.danger,
      value: palette.danger,
      bar: palette.danger,
    },
    stale: {
      rule: tierRule(palette, tier),
      kicker: palette.dim,
      value: palette.dim,
      bar: palette.ink,
    },
  };
  return byTone[tone];
};
