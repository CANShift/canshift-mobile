import type { TextStyle } from "react-native";
import { DARK_TOKENS } from "@canshift/core";

const MOBILE_ALIASES = {
  surfaceHigh: DARK_TOKENS.colors.surface2,
  white: DARK_TOKENS.colors.primaryForeground,
} as const;

export const Colors = {
  ...DARK_TOKENS.colors,
  ...MOBILE_ALIASES,
} as const;

export const Spacing = DARK_TOKENS.spacing;
export const Radius = DARK_TOKENS.radii;
export const Typography = DARK_TOKENS.typography;

export const Fonts = {
  ui: "Archivo_400Regular",
  uiSemiBold: "Archivo_600SemiBold",
  uiExtraBold: "Archivo_800ExtraBold",
  mono: "JetBrainsMono_400Regular",
  monoBold: "JetBrainsMono_700Bold",
  monoExtraBold: "JetBrainsMono_800ExtraBold",
} as const;

export const TabularNums: NonNullable<TextStyle["fontVariant"]> = [
  "tabular-nums",
];

export const UI_LABEL_TRACKING = 1.4;

export const labelStyle: TextStyle = {
  fontFamily: Fonts.uiExtraBold,
  letterSpacing: UI_LABEL_TRACKING,
  textTransform: "uppercase",
};

export const valueStyle: TextStyle = {
  fontFamily: Fonts.mono,
  fontVariant: TabularNums,
};

export type { DesignTokens } from "@canshift/core";

export const HitSlop = {
  default: { top: 8, bottom: 8, left: 8, right: 8 },
  large: { top: 12, bottom: 12, left: 12, right: 12 },
  vertical: { top: 4, bottom: 4, left: 0, right: 0 },
} as const;
