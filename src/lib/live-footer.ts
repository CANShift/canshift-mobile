import { STRINGS } from "../strings";
import { UiColors } from "../theme/ui-tokens";
import type { Link } from "./link-model";

export type FooterState = "live" | "noData" | "paused";

export interface FooterInputs {
  link: Link;
  noData: boolean;
  rate: number;
  secondsSinceData: number;
}

export interface FooterLook {
  dotColor: string;
  dotFilled: boolean;
  showsDisplay: boolean;
  text: (inputs: FooterInputs) => string;
}

export const footerState = ({ link, noData }: FooterInputs): FooterState => {
  if (link === "reconnecting") return "paused";
  return link === "connected" && noData ? "noData" : "live";
};

export const FOOTER_LOOKS: Record<FooterState, FooterLook> = {
  live: {
    dotColor: UiColors.success,
    dotFilled: true,
    showsDisplay: true,
    text: ({ rate }) => STRINGS.live.footerLive(rate),
  },
  noData: {
    dotColor: UiColors.textMuted,
    dotFilled: false,
    showsDisplay: true,
    text: ({ secondsSinceData }) => STRINGS.live.footerNoData(secondsSinceData),
  },
  paused: {
    dotColor: UiColors.warning,
    dotFilled: false,
    showsDisplay: false,
    text: () => STRINGS.live.footerReconnecting,
  },
};
