import type { ConnectionState, DeviceMode } from "../stores/device.store";

export type Link =
  "scanning" | "connecting" | "connected" | "reconnecting" | "offline" | "demo";

export interface LinkInputs {
  connectionState: ConnectionState;
  mode: DeviceMode;
  isReconnecting: boolean;
}

const LINK_BY_CONNECTION: Record<ConnectionState, Link> = {
  idle: "offline",
  scanning: "scanning",
  connecting: "connecting",
  connected: "connected",
  error: "offline",
};

export const deriveLink = ({
  connectionState,
  mode,
  isReconnecting,
}: LinkInputs): Link => {
  if (mode === "sim") return "demo";
  if (isReconnecting) return "reconnecting";
  return LINK_BY_CONNECTION[connectionState];
};

const LINKS_THAT_KEEP_AWAKE: ReadonlySet<Link> = new Set<Link>([
  "connected",
  "reconnecting",
  "demo",
]);

export const keepsScreenAwake = (link: Link): boolean =>
  LINKS_THAT_KEEP_AWAKE.has(link);
