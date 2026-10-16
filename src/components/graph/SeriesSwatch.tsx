import Svg, { Line } from "react-native-svg";
import type { SeriesStyle } from "../../lib/graph-config";

const WIDTH = 18;
const HEIGHT = 4;

export interface SeriesSwatchProps {
  series: SeriesStyle;
}

export const SeriesSwatch = ({ series }: SeriesSwatchProps) => (
  <Svg width={WIDTH} height={HEIGHT}>
    <Line
      x1={0}
      x2={WIDTH}
      y1={HEIGHT / 2}
      y2={HEIGHT / 2}
      stroke={series.color}
      strokeWidth={HEIGHT}
      strokeDasharray={series.dash ?? "0"}
    />
  </Svg>
);
