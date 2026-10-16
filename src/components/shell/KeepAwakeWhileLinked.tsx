import { useKeepAwake } from "expo-keep-awake";
import { useLink } from "../../hooks/use-link";
import { keepsScreenAwake } from "../../lib/link-model";

const KEEP_AWAKE_TAG = "canshift-linked";

const KeepAwake = () => {
  useKeepAwake(KEEP_AWAKE_TAG);
  return null;
};

export const KeepAwakeWhileLinked = () =>
  keepsScreenAwake(useLink()) ? <KeepAwake /> : null;
