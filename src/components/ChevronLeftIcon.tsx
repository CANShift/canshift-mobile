import Svg, { Path } from "react-native-svg";

const ICON_VIEWBOX = "0 0 24 24";
const ICON_STROKE_WIDTH = 2;
const CHEVRON_LEFT_PATH = "m15 18-6-6 6-6";

interface ChevronLeftIconProps {
  size: number;
  color: string;
}

export const ChevronLeftIcon = ({ size, color }: ChevronLeftIconProps) => (
  <Svg width={size} height={size} viewBox={ICON_VIEWBOX} fill="none">
    <Path
      d={CHEVRON_LEFT_PATH}
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
