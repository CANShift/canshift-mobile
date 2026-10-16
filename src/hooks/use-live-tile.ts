import { useSignalsStore } from "../stores/signals.store";
import { tileModel, type TileModel } from "../lib/tile-state";
import type { LiveTileSpec } from "../lib/live-tiles";

export const useLiveTile = (
  spec: LiveTileSpec,
  paused: boolean,
  nowMs: number,
): TileModel => {
  const value = useSignalsStore((s) => s.values[spec.signal]);
  const lastAt = useSignalsStore((s) => s.lastAt[spec.signal]);
  return tileModel(spec, { value, lastAt, paused, nowMs });
};
