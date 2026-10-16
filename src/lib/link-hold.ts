const MS_PER_SECOND = 1000;

export const LINK_HOLD_MS = 30_000;

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

export const linkLostLabel = (seconds: number): string =>
  `LINK LOST ${String(seconds)} s AGO`;
