import * as Haptics from "expo-haptics";
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import type { AlertSource } from "@canshift/core";
import { useAlertsStore } from "../stores/alerts.store";
import { alertViews } from "../lib/alert-views";
import { reportFailure } from "../lib/report-dash-failure";
import { STRINGS } from "../strings";
import ALERT_SOUND from "../../assets/sounds/critical-alert.wav";

let player: AudioPlayer | null = null;

const playCue = async (): Promise<void> => {
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    player ??= createAudioPlayer(ALERT_SOUND);
    await player.seekTo(0);
    player.play();
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (err) {
    reportFailure("Alert cue", err, STRINGS.alert.cueFailed);
  }
};

const takeoverSources = (): Set<AlertSource> =>
  new Set(
    alertViews(useAlertsStore.getState()).takeover.map((entry) => entry.source),
  );

export const startAlertCues = (): (() => void) => {
  let shown = takeoverSources();
  return useAlertsStore.subscribe(() => {
    const next = takeoverSources();
    const raised = [...next].some((source) => !shown.has(source));
    shown = next;
    if (raised) void playCue();
  });
};
