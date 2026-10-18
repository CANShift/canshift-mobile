import { Polyline } from "react-native-svg";
import type { SignalKey } from "../../constants/ble";
import { buildPoints } from "../../lib/graph-math";
import { seriesStyle } from "../../lib/graph-config";
import type { GraphSeries } from "../../hooks/use-graph-series";
import { VIEW_H, VIEW_W } from "./graph-view-box";

const TRACE_WIDTH = 2.5;
const NO_DASH = "0";

interface GraphTracesProps {
  series: GraphSeries;
  signals: readonly SignalKey[];
}

export const GraphTraces = ({ series, signals }: GraphTracesProps) => (
  <>
    {signals.map((key, index) => {
      const style = seriesStyle(index);
      return (
        <Polyline
          key={key}
          points={buildPoints(
            series.rolling,
            key,
            series.windowStart,
            series.windowEnd,
            VIEW_W,
            VIEW_H,
          )}
          fill="none"
          stroke={style.color}
          strokeWidth={TRACE_WIDTH}
          strokeLinejoin="round"
          strokeDasharray={style.dash ?? NO_DASH}
        />
      );
    })}
  </>
);
