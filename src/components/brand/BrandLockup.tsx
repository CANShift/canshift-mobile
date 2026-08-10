import React from "react";
import Svg, { G, Path } from "react-native-svg";
import {
  BASELINE_TEXT_PATH,
  BRAND_ACCENT,
  BRAND_PAPER,
  LOCKUP_BASELINE_OPACITY,
  LOCKUP_BASELINE_TRANSFORM,
  LOCKUP_BASELINE_VIEWBOX,
  LOCKUP_DIVIDER,
  LOCKUP_MONOGRAM_TRANSFORM,
  LOCKUP_WORDMARK_TRANSFORM,
  WORDMARK_CAN_PATH,
  WORDMARK_SHIFT_PATH,
} from "@canshift/core";
import { Colors } from "../../theme";

const MOBILE_MARK_BARS = ["M26 78 V64", "M48 78 V52", "M70 78 V38"];
const MOBILE_MARK_ACCENT_BAR = "M92 78 V24";
const MOBILE_MARK_BASELINE = "M18 90 H100";
const MOBILE_MARK_BAR_STROKE = 13;
const MOBILE_MARK_BASELINE_STROKE = 7;

export interface BrandLockupProps {
  width: number;
  maxHeight?: number;
}

const VIEWBOX_WIDTH = 590;
const VIEWBOX_HEIGHT = 190;

const fittedWidth = (width: number, maxHeight?: number): number =>
  maxHeight === undefined
    ? width
    : Math.min(width, (maxHeight * VIEWBOX_WIDTH) / VIEWBOX_HEIGHT);

export const BrandLockup = ({ width, maxHeight }: BrandLockupProps) => (
  <Svg
    viewBox={LOCKUP_BASELINE_VIEWBOX}
    width={fittedWidth(width, maxHeight)}
    height={(fittedWidth(width, maxHeight) * VIEWBOX_HEIGHT) / VIEWBOX_WIDTH}
    accessibilityRole="image"
    accessibilityLabel="CANShift — dash CANbus firmware"
  >
    <G transform={LOCKUP_MONOGRAM_TRANSFORM} fill="none" strokeLinecap="butt">
      {MOBILE_MARK_BARS.map((d) => (
        <Path
          key={d}
          d={d}
          stroke={BRAND_PAPER}
          strokeWidth={MOBILE_MARK_BAR_STROKE}
        />
      ))}
      <Path
        d={MOBILE_MARK_ACCENT_BAR}
        stroke={Colors.accent}
        strokeWidth={MOBILE_MARK_BAR_STROKE}
      />
      <Path
        d={MOBILE_MARK_BASELINE}
        stroke={BRAND_PAPER}
        strokeWidth={MOBILE_MARK_BASELINE_STROKE}
      />
    </G>
    <Path
      d={`M${String(LOCKUP_DIVIDER.x)} ${String(LOCKUP_DIVIDER.y)} h${String(LOCKUP_DIVIDER.width)} v${String(LOCKUP_DIVIDER.height)} h-${String(LOCKUP_DIVIDER.width)} Z`}
      fill={BRAND_PAPER}
      opacity={LOCKUP_DIVIDER.opacity}
    />
    <G transform={LOCKUP_WORDMARK_TRANSFORM}>
      <Path fill={BRAND_PAPER} d={WORDMARK_CAN_PATH} />
      <Path fill={BRAND_ACCENT} d={WORDMARK_SHIFT_PATH} />
    </G>
    <G transform={LOCKUP_BASELINE_TRANSFORM} opacity={LOCKUP_BASELINE_OPACITY}>
      <Path fill={BRAND_PAPER} d={BASELINE_TEXT_PATH} />
    </G>
  </Svg>
);
