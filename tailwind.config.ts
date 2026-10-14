import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import { DARK_TOKENS } from "@canshift/core";
import { Fonts, Radius } from "./src/theme";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const nativewindPreset = require("nativewind/preset") as Config;

const toKebab = (key: string): string =>
  key.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();

const tokenColorClasses = (): Record<string, string> =>
  Object.fromEntries(
    Object.entries(DARK_TOKENS.colors).map(([key, value]) => [
      toKebab(key),
      value,
    ]),
  );

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./App.tsx"],
  presets: [nativewindPreset],
  theme: {
    extend: {
      fontFamily: {
        ui: [Fonts.ui],
        "ui-semibold": [Fonts.uiSemiBold],
        "ui-extrabold": [Fonts.uiExtraBold],
        mono: [Fonts.mono],
        "mono-extrabold": [Fonts.monoExtraBold],
      },
      colors: tokenColorClasses(),
      borderRadius: {
        sm: `${Radius.sm}px`,
        md: `${Radius.md}px`,
        lg: `${Radius.lg}px`,
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
