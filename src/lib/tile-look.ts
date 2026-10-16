import { UiColors } from "../theme/ui-tokens";
import type { TileState } from "./tile-state";

export interface TileLook {
  background: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: "solid" | "dashed";
  labelColor: string;
  valueColor: string;
  unitColor: string;
  tagColor: string;
  showsClock: boolean;
  tagCaps: boolean;
}

const STALE_LOOK: TileLook = {
  background: UiColors.bg,
  borderColor: UiColors.borderStrong,
  borderWidth: 1.5,
  borderStyle: "dashed",
  labelColor: UiColors.labelStale,
  valueColor: UiColors.textStale,
  unitColor: UiColors.textStale,
  tagColor: UiColors.textMuted,
  showsClock: true,
  tagCaps: false,
};

export const TILE_LOOKS: Record<TileState, TileLook> = {
  normal: {
    background: UiColors.surface,
    borderColor: UiColors.border,
    borderWidth: 1,
    borderStyle: "solid",
    labelColor: UiColors.textMuted,
    valueColor: UiColors.text,
    unitColor: UiColors.textMuted,
    tagColor: UiColors.textMuted,
    showsClock: false,
    tagCaps: false,
  },
  warning: {
    background: UiColors.warningBg,
    borderColor: UiColors.warning,
    borderWidth: 2,
    borderStyle: "solid",
    labelColor: UiColors.warningText,
    valueColor: UiColors.warning,
    unitColor: UiColors.warningText,
    tagColor: UiColors.warningText,
    showsClock: false,
    tagCaps: true,
  },
  danger: {
    background: UiColors.dangerBg,
    borderColor: UiColors.dangerBorder,
    borderWidth: 2,
    borderStyle: "solid",
    labelColor: UiColors.dangerLabel,
    valueColor: UiColors.dangerValue,
    unitColor: UiColors.dangerLabel,
    tagColor: UiColors.dangerLabel,
    showsClock: false,
    tagCaps: true,
  },
  stale: STALE_LOOK,
  nodata: STALE_LOOK,
};
