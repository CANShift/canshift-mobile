import { View } from "react-native";

const BORDER_WIDTH = 2;

export interface LinkDotProps {
  color: string;
  filled: boolean;
  size: number;
}

export const LinkDot = ({ color, filled, size }: LinkDotProps) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: BORDER_WIDTH,
      borderColor: color,
      backgroundColor: filled ? color : "transparent",
    }}
  />
);
