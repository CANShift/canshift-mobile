import Svg, { Circle, Path } from "react-native-svg";

export interface ClockIconProps {
  color: string;
  size: number;
}

export const ClockIcon = ({ color, size }: ClockIconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx="12" cy="12" r="9" />
    <Path d="M12 7v5l3 2" />
  </Svg>
);
