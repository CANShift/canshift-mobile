import { useDeviceStore } from "../stores/device.store";
import { useReconnectStore } from "../stores/reconnect.store";
import { deriveLink, type Link } from "../lib/link-model";

export const useLink = (): Link => {
  const connectionState = useDeviceStore((s) => s.connectionState);
  const mode = useDeviceStore((s) => s.mode);
  const isReconnecting = useReconnectStore((s) => s.isReconnecting);
  return deriveLink({ connectionState, mode, isReconnecting });
};
