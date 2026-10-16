import { AlertTakeover } from "../alerts/AlertTakeover";
import ReconnectFailedDialog from "../ReconnectFailedDialog";
import { useOverlayStack } from "../../hooks/use-overlay-stack";
import type { Takeover } from "../../lib/overlay-stack";

const TAKEOVERS: Record<Takeover, () => React.JSX.Element | null> = {
  criticalAlert: AlertTakeover,
  reconnectFailed: ReconnectFailedDialog,
  none: () => null,
};

export const OverlayHost = () => {
  const Takeover = TAKEOVERS[useOverlayStack().takeover];
  return <Takeover />;
};
