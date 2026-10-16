import Svg, { Circle, Path } from "react-native-svg";

export type GlyphName =
  "pause" | "play" | "export" | "plus" | "close" | "check" | "search" | "chart";

const STROKES: Record<GlyphName, readonly string[]> = {
  pause: [],
  play: [],
  export: ["M12 16V4M7 9l5-5 5 5M4 20h16"],
  plus: ["M12 5v14M5 12h14"],
  close: ["M6 6l12 12M18 6L6 18"],
  check: ["M5 12l5 5L20 7"],
  search: ["M20 20l-4-4"],
  chart: ["M3 3v18h18", "M7 15l4-4 3 3 5-6"],
};

const FILLS: Record<GlyphName, readonly string[]> = {
  pause: [
    "M7 5h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM15 5h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  ],
  play: [
    "M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z",
  ],
  export: [],
  plus: [],
  close: [],
  check: [],
  search: [],
  chart: [],
};

const CIRCLES: Partial<
  Record<GlyphName, { cx: number; cy: number; r: number }>
> = {
  search: { cx: 11, cy: 11, r: 7 },
};

export interface GlyphProps {
  name: GlyphName;
  size: number;
  color: string;
  strokeWidth?: number;
}

export const Glyph = ({ name, size, color, strokeWidth = 2.5 }: GlyphProps) => {
  const circle = CIRCLES[name];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {STROKES[name].map((d) => (
        <Path key={d} d={d} />
      ))}
      {FILLS[name].map((d) => (
        <Path key={d} d={d} fill={color} stroke="none" />
      ))}
      {circle === undefined ? null : <Circle {...circle} />}
    </Svg>
  );
};
