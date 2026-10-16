import type { LiveTileSpec } from "../../lib/live-tiles";
import { useLiveTile } from "../../hooks/use-live-tile";
import ValueTile from "./ValueTile";

export interface LiveTileProps {
  spec: LiveTileSpec;
  paused: boolean;
  nowMs: number;
  valueSize: number;
}

export const LiveTile = ({ spec, paused, nowMs, valueSize }: LiveTileProps) => {
  const model = useLiveTile(spec, paused, nowMs);
  return (
    <ValueTile
      label={spec.label}
      value={model.text}
      unit={spec.unit}
      state={model.state}
      tag={model.tag}
      accessibilityLabel={model.accessibilityLabel}
      valueSize={valueSize}
    />
  );
};
