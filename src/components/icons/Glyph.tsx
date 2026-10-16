import Svg, { Circle, Path } from "react-native-svg";

export type GlyphName =
  | "pause"
  | "play"
  | "export"
  | "plus"
  | "close"
  | "check"
  | "search"
  | "chart"
  | "link"
  | "target"
  | "frames"
  | "warning"
  | "back"
  | "chevron";

const STROKES: Record<GlyphName, readonly string[]> = {
  pause: [],
  play: [],
  export: ["M12 16V4M7 9l5-5 5 5M4 20h16"],
  plus: ["M12 5v14M5 12h14"],
  close: ["M6 6l12 12M18 6L6 18"],
  check: ["M5 12l5 5L20 7"],
  search: ["M20 20l-4-4"],
  chart: ["M3 3v18h18", "M7 15l4-4 3 3 5-6"],
  link: [
    "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1",
    "M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1",
  ],
  target: ["M12 1v3M12 20v3M1 12h3M20 12h3"],
  frames: [
    "M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    "M7 9h4M7 13h10M7 17h6",
  ],
  warning: ["M12 3l10 18H2z", "M12 10v5M12 18v.5"],
  back: ["M15 6l-6 6 6 6"],
  chevron: ["M9 6l6 6-6 6"],
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
  link: [],
  target: [],
  frames: [],
  warning: [],
  back: [],
  chevron: [],
};

interface GlyphCircle {
  cx: number;
  cy: number;
  r: number;
}

const CIRCLES: Partial<Record<GlyphName, readonly GlyphCircle[]>> = {
  search: [{ cx: 11, cy: 11, r: 7 }],
  target: [
    { cx: 12, cy: 12, r: 4 },
    { cx: 12, cy: 12, r: 8 },
  ],
};

export interface GlyphProps {
  name: GlyphName;
  size: number;
  color: string;
  strokeWidth?: number;
}

export const Glyph = ({ name, size, color, strokeWidth = 2.5 }: GlyphProps) => {
  const circles = CIRCLES[name] ?? [];
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
      {circles.map((circle) => (
        <Circle key={circle.r} {...circle} />
      ))}
    </Svg>
  );
};
