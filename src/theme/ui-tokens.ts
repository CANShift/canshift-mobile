import { Platform } from "react-native";

export const UiColors = {
  bg: "#0E0F11",
  surface: "#16181B",
  surface2: "#1E2125",
  border: "#2B2F35",
  borderRow: "#23262B",
  borderStrong: "#3A3F46",
  text: "#F2F3F5",
  textSecondary: "#C9CDD2",
  textMuted: "#A0A6AD",
  textStale: "#6B7178",
  labelStale: "#8A9097",
  accent: "#FF4747",
  primaryBtn: "#D63333",
  onPrimary: "#FFFFFF",
  warning: "#FF8800",
  warningBg: "#2A1C0A",
  warningText: "#FFC27A",
  warningTextStrong: "#FFD9A8",
  warningBorder: "#5A3A12",
  dangerBorder: "#FF4747",
  dangerBg: "#2A1010",
  dangerValue: "#FF6B6B",
  dangerLabel: "#FFB3B3",
  success: "#3DD68C",
  successBg: "#123826",
  successText: "#B8F2D3",
} as const;

export const ChartSeriesColors = [
  "#F2F3F5",
  "#4DA3FF",
  "#B78CFF",
  "#FFD166",
] as const;

export const UiRadius = {
  control: 10,
  tile: 12,
  card: 14,
  sheet: 16,
} as const;

export const UiFonts = {
  numeric: Platform.select({ ios: "Menlo", default: "monospace" }),
} as const;
