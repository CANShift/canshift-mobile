import {
  GEAR_NEUTRAL_GLYPH,
  WIDGET_STALE_TEXT_COLORS,
  WIDGET_ZONE_COLORS,
  formatTimerMmSs,
  formatTimerSsMmm,
  gearGlyph,
  isWarningTripped,
  widgetTextColor,
} from "@canshift/core";
import { Colors } from "../../theme";
import { placeholderForText } from "../../lib/link-hold";

const TIMER_MSEC_FORMAT_MAX_MS = 60_000;

export const formatTimerElapsed = (
  elapsedMs: number,
  colonVisible: boolean,
): string =>
  elapsedMs < TIMER_MSEC_FORMAT_MAX_MS
    ? formatTimerSsMmm(elapsedMs)
    : formatTimerMmSs(elapsedMs, colonVisible);

export const formatWidgetValue = (value: number, decimals: number): string =>
  decimals === 0 ? Math.round(value).toString() : value.toFixed(decimals);

export const staleTextColor = (dayMode: boolean): string =>
  dayMode ? WIDGET_STALE_TEXT_COLORS.day : Colors.textMuted;

export const heldPlaceholder = (
  value: number | undefined,
  decimals: number,
): string =>
  placeholderForText(
    value === undefined ? undefined : formatWidgetValue(value, decimals),
  );

export type WarnState = "idle" | "alarm" | "stale";

export const gearGlyphFor = (value: number | undefined): string =>
  value === undefined ? GEAR_NEUTRAL_GLYPH : gearGlyph(value);

export const gearColor = (
  value: number | undefined,
  dayMode: boolean,
): string => {
  if (value === undefined) return staleTextColor(dayMode);
  return Math.trunc(value) < 0
    ? WIDGET_ZONE_COLORS.warning
    : widgetTextColor(dayMode);
};

export const warningState = (
  value: number | undefined,
  threshold: number,
  invertLogic: boolean,
): WarnState => {
  if (value === undefined) return "stale";
  return isWarningTripped(value, threshold, invertLogic) ? "alarm" : "idle";
};
