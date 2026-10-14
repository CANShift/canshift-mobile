import {
  GEAR_NEUTRAL_GLYPH,
  formatTimerMmSs,
  formatTimerSsMmm,
  gearGlyph,
} from "@canshift/core";
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

export const heldPlaceholder = (
  value: number | undefined,
  decimals: number,
): string =>
  placeholderForText(
    value === undefined ? undefined : formatWidgetValue(value, decimals),
  );

export const gearGlyphFor = (value: number | undefined): string =>
  value === undefined ? GEAR_NEUTRAL_GLYPH : gearGlyph(value);
