import { formatTimerMmSs, formatTimerSsMmm } from "@canshift/core";

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
