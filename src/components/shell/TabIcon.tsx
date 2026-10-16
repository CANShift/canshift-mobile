import Svg, { Circle, Path } from "react-native-svg";
import type { ShellTab } from "../../lib/shell-tabs";

const VIEWBOX = "0 0 24 24";
const STROKE_WIDTH = 2;

const LiveGlyph = () => (
  <>
    <Path d="M3.3 17a9 9 0 1 1 17.4 0" />
    <Path d="M12 14l4-4" />
  </>
);

const GraphGlyph = () => (
  <>
    <Path d="M3 3v18h18" />
    <Path d="M7 15l4-4 3 3 5-6" />
  </>
);

const LapsGlyph = () => (
  <>
    <Circle cx="12" cy="14" r="7" />
    <Path d="M12 10v4l2 2M10 3h4" />
  </>
);

const DeviceGlyph = () => (
  <>
    <Path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" />
    <Circle cx="16" cy="6" r="2" />
    <Circle cx="10" cy="12" r="2" />
    <Circle cx="18" cy="18" r="2" />
  </>
);

const GLYPHS: Record<ShellTab, () => React.JSX.Element> = {
  Live: LiveGlyph,
  Graph: GraphGlyph,
  Laps: LapsGlyph,
  Device: DeviceGlyph,
};

export interface TabIconProps {
  tab: ShellTab;
  color: string;
  size: number;
}

export const TabIcon = ({ tab, color, size }: TabIconProps) => {
  const Glyph = GLYPHS[tab];
  return (
    <Svg
      width={size}
      height={size}
      viewBox={VIEWBOX}
      fill="none"
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Glyph />
    </Svg>
  );
};
