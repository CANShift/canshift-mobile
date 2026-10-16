import { UiColors } from "../ui-tokens";

const MIN_TEXT_CONTRAST = 4.5;

const channel = (hex: string, offset: number): number => {
  const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number =>
  0.2126 * channel(hex, 1) +
  0.7152 * channel(hex, 3) +
  0.0722 * channel(hex, 5);

const contrast = (a: string, b: string): number => {
  const light = Math.max(luminance(a), luminance(b));
  const dark = Math.min(luminance(a), luminance(b));
  return (light + 0.05) / (dark + 0.05);
};

const TEXT_ON_GROUND: readonly [string, string, string][] = [
  ["text on bg", UiColors.text, UiColors.bg],
  ["secondary on surface", UiColors.textSecondary, UiColors.surface],
  ["muted on surface", UiColors.textMuted, UiColors.surface],
  ["white on the primary button", UiColors.onPrimary, UiColors.primaryBtn],
  ["warning text on warning bg", UiColors.warningText, UiColors.warningBg],
  ["warning value on warning bg", UiColors.warning, UiColors.warningBg],
  ["danger value on danger bg", UiColors.dangerValue, UiColors.dangerBg],
  ["danger label on danger bg", UiColors.dangerLabel, UiColors.dangerBg],
  ["success text on success bg", UiColors.successText, UiColors.successBg],
];

describe("the redesign palette", () => {
  it.each(TEXT_ON_GROUND)("keeps %s at 4.5:1 or more", (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });
});
