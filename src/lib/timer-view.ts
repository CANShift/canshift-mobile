import { STRINGS } from "../strings";
import { UiColors } from "../theme/ui-tokens";
import type { TimerStatus } from "../stores/timer.store";
import type { TagTone } from "../components/laps/StatusTag";
import type { BigButtonTone } from "../components/buttons/BigButton";
import type { GlyphName } from "../components/icons/Glyph";

export type TimerAction = "start" | "pause" | "resume" | "lap" | "askReset";

export interface TimerButton {
  label: string;
  tone: BigButtonTone;
  glyph?: GlyphName;
  action: TimerAction;
}

export interface TimerView {
  tag: string;
  tagTone: TagTone;
  tagGlyph?: GlyphName;
  chronoColor: string;
  primary: TimerButton;
  secondary: TimerButton | null;
}

export const TIMER_VIEWS: Record<TimerStatus, TimerView> = {
  idle: {
    tag: STRINGS.laps.ready,
    tagTone: "neutral",
    chronoColor: UiColors.text,
    primary: {
      label: STRINGS.laps.start,
      tone: "primary",
      glyph: "play",
      action: "start",
    },
    secondary: null,
  },
  running: {
    tag: STRINGS.laps.running,
    tagTone: "success",
    chronoColor: UiColors.text,
    primary: { label: STRINGS.laps.captureLap, tone: "light", action: "lap" },
    secondary: {
      label: STRINGS.laps.pause,
      tone: "outline",
      glyph: "pause",
      action: "pause",
    },
  },
  paused: {
    tag: STRINGS.laps.pausedTag,
    tagTone: "warning",
    tagGlyph: "pause",
    chronoColor: UiColors.warning,
    primary: {
      label: STRINGS.laps.resume,
      tone: "primary",
      glyph: "play",
      action: "resume",
    },
    secondary: {
      label: STRINGS.laps.resetEllipsis,
      tone: "dangerOutline",
      action: "askReset",
    },
  },
};

export interface TimerSource {
  label: string;
  tone: TagTone;
  glyph?: GlyphName;
  hint: string;
}

export const timerSource = (synced: boolean): TimerSource =>
  synced
    ? {
        label: STRINGS.laps.synced,
        tone: "successOutline",
        glyph: "link",
        hint: STRINGS.laps.syncedHint,
      }
    : {
        label: STRINGS.laps.phoneOnly,
        tone: "warningOutline",
        hint: STRINGS.laps.phoneOnlyBody,
      };
