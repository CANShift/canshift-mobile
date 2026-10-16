import type { Link } from "./link-model";

export type ConnectionAction = "disconnect" | "reconnect" | "none";

export const CONNECTION_ACTIONS: Record<Link, ConnectionAction> = {
  connected: "disconnect",
  reconnecting: "none",
  connecting: "none",
  scanning: "none",
  offline: "reconnect",
  demo: "none",
};
