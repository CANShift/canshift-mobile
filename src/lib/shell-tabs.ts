import { STRINGS } from "../strings";
import { UiColors } from "../theme/ui-tokens";

export type ShellTab = "Live" | "Graph" | "Laps" | "Device";

export const SHELL_TABS: readonly ShellTab[] = [
  "Live",
  "Graph",
  "Laps",
  "Device",
];

export const SHELL_TAB_LABELS: Record<ShellTab, string> = {
  Live: STRINGS.tabs.live,
  Graph: STRINGS.tabs.graph,
  Laps: STRINGS.tabs.laps,
  Device: STRINGS.tabs.device,
};

export interface TabLook {
  textColor: string;
  iconColor: string;
  fontWeight: "700" | "500";
}

const ACTIVE_LOOK: TabLook = {
  textColor: UiColors.text,
  iconColor: UiColors.accent,
  fontWeight: "700",
};

const IDLE_LOOK: TabLook = {
  textColor: UiColors.textMuted,
  iconColor: UiColors.textMuted,
  fontWeight: "500",
};

export const tabLook = (focused: boolean): TabLook =>
  focused ? ACTIVE_LOOK : IDLE_LOOK;

export const isShellTab = (name: string): name is ShellTab =>
  (SHELL_TABS as readonly string[]).includes(name);
