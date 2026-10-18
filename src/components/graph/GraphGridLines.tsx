import { Line } from "react-native-svg";
import { UiColors } from "../../theme/ui-tokens";
import { VIEW_H, VIEW_W } from "./graph-view-box";

const GRID_ROWS = [0.25, 0.5, 0.75];

export const GraphGridLines = () => (
  <>
    {GRID_ROWS.map((row) => (
      <Line
        key={row}
        x1={0}
        x2={VIEW_W}
        y1={VIEW_H * row}
        y2={VIEW_H * row}
        stroke={UiColors.borderRow}
        strokeWidth={1}
      />
    ))}
    <Line
      x1={VIEW_W / 2}
      x2={VIEW_W / 2}
      y1={0}
      y2={VIEW_H}
      stroke={UiColors.borderRow}
      strokeWidth={1}
    />
  </>
);
