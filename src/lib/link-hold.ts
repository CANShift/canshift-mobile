import { STALE_PLACEHOLDER } from "@canshift/core";

const MS_PER_SECOND = 1000;
const DIGITS = /\d/g;

export const LINK_HOLD_MS = 30_000;

export const LINK_HOLD_POLICY_COPY = `Last values held ${String(LINK_HOLD_MS / MS_PER_SECOND)} s, then cleared. Reconnecting automatically.`;

export type LinkState = "live" | "waiting" | "lost";

export const linkState = (isLive: boolean, staleSinceMs: number): LinkState => {
  if (isLive) return "live";
  return staleSinceMs > 0 ? "lost" : "waiting";
};

export const linkLostSeconds = (staleSinceMs: number, nowMs: number): number =>
  staleSinceMs > 0
    ? Math.max(0, Math.floor((nowMs - staleSinceMs) / MS_PER_SECOND))
    : 0;

export const isHoldExpired = (staleSinceMs: number, nowMs: number): boolean =>
  staleSinceMs > 0 && nowMs - staleSinceMs >= LINK_HOLD_MS;

export const dashPlaceholder = (digits: number): string =>
  digits > 0 ? new Array(digits).fill("-").join(" ") : STALE_PLACEHOLDER;

export const placeholderForText = (text: string | undefined): string =>
  dashPlaceholder(text === undefined ? 0 : (text.match(DIGITS) ?? []).length);

export const linkLostLabel = (seconds: number): string =>
  `LINK LOST ${String(seconds)} s AGO`;
