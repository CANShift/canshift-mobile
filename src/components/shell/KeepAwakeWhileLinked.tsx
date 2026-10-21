import { useKeepAwake } from "expo-keep-awake";
import { useLink } from "../../hooks/use-link";
import { keepsScreenAwake } from "../../lib/link-model";
import { useAppSettingsStore } from "../../stores/app-settings.store";
import { useTrackSessionStore } from "../../stores/track-session.store";

const KEEP_AWAKE_TAG = "canshift-linked";

const KeepAwake = () => {
  useKeepAwake(KEEP_AWAKE_TAG);
  return null;
};

export const KeepAwakeWhileLinked = () => {
  const link = useLink();
  const enabled = useAppSettingsStore((s) => s.keepScreenOn);
  const recording = useTrackSessionStore((s) => s.recording);
  const awake = recording || (enabled && keepsScreenAwake(link));
  return awake ? <KeepAwake /> : null;
};
