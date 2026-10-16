import { useKeepAwake } from "expo-keep-awake";
import { useLink } from "../../hooks/use-link";
import { keepsScreenAwake } from "../../lib/link-model";
import { useAppSettingsStore } from "../../stores/app-settings.store";

const KEEP_AWAKE_TAG = "canshift-linked";

const KeepAwake = () => {
  useKeepAwake(KEEP_AWAKE_TAG);
  return null;
};

export const KeepAwakeWhileLinked = () => {
  const link = useLink();
  const enabled = useAppSettingsStore((s) => s.keepScreenOn);
  return enabled && keepsScreenAwake(link) ? <KeepAwake /> : null;
};
