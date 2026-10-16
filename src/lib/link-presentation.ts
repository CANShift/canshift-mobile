import { STRINGS } from "../strings";
import { UiColors } from "../theme/ui-tokens";
import type { Link } from "./link-model";

export interface LinkPresentation {
  label: string;
  railLabel: string;
  dotColor: string;
  dotFilled: boolean;
  labelColor: string;
}

export const LINK_PRESENTATION: Record<Link, LinkPresentation> = {
  connected: {
    label: STRINGS.link.connected,
    railLabel: STRINGS.rail.linked,
    dotColor: UiColors.success,
    dotFilled: true,
    labelColor: UiColors.text,
  },
  demo: {
    label: STRINGS.link.demo,
    railLabel: STRINGS.link.demo,
    dotColor: UiColors.warning,
    dotFilled: true,
    labelColor: UiColors.text,
  },
  reconnecting: {
    label: STRINGS.link.reconnecting,
    railLabel: STRINGS.rail.retrying,
    dotColor: UiColors.warning,
    dotFilled: false,
    labelColor: UiColors.warning,
  },
  connecting: {
    label: STRINGS.link.connecting,
    railLabel: STRINGS.rail.off,
    dotColor: UiColors.textMuted,
    dotFilled: false,
    labelColor: UiColors.text,
  },
  scanning: {
    label: STRINGS.link.scanning,
    railLabel: STRINGS.rail.off,
    dotColor: UiColors.textMuted,
    dotFilled: false,
    labelColor: UiColors.text,
  },
  offline: {
    label: STRINGS.link.offline,
    railLabel: STRINGS.rail.off,
    dotColor: UiColors.textMuted,
    dotFilled: false,
    labelColor: UiColors.text,
  },
};

export type HeaderBadge = "logging" | "demo" | "none";

export const headerBadge = (link: Link, isLogging: boolean): HeaderBadge => {
  if (link === "demo") return "demo";
  return isLogging ? "logging" : "none";
};
