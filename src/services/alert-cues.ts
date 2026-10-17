import * as Haptics from "expo-haptics";
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import type { AlertKey } from "../lib/alert-model";
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

const takeoverKeys = (): Set<AlertKey> =>
  new Set(
    alertViews(useAlertsStore.getState()).takeover.map((entry) => entry.key),
  );

export const startAlertCues = (): (() => void) => {
  let shown = takeoverKeys();
  return useAlertsStore.subscribe(() => {
    const next = takeoverKeys();
    const raised = [...next].some((key) => !shown.has(key));
    shown = next;
    if (raised) void playCue();
  });
};
