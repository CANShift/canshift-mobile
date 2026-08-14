import { useShallow } from "zustand/react/shallow";
import { useDeviceStore } from "../../stores/device.store";
import {
  CAN_EMPTY_MESSAGE,
  OPEN_LOG_LABEL,
  canLinkFooter,
} from "../../lib/can-stream";
import { ConsoleEmpty } from "./ConsoleEmpty";

export interface CanTabProps {
  onOpenLog: () => void;
}

export const CanTab = ({ onOpenLog }: CanTabProps) => {
  const { mode, connectionState } = useDeviceStore(
    useShallow((s) => ({ mode: s.mode, connectionState: s.connectionState })),
  );

  return (
    <ConsoleEmpty
      action={{ label: OPEN_LOG_LABEL, onPress: onOpenLog }}
      footer={canLinkFooter(mode, connectionState)}
    >
      {CAN_EMPTY_MESSAGE}
    </ConsoleEmpty>
  );
};
