import { STRINGS } from "../../strings";
import type { DeviceDialog } from "../../hooks/use-device-screen";
import { ConfirmDialog } from "../dialog/ConfirmDialog";

type ConfirmKind = Exclude<DeviceDialog, "none">;

interface ConfirmCopy {
  title: string;
  body: string;
  confirmLabel: string;
}

const COPY: Record<ConfirmKind, ConfirmCopy> = {
  disconnect: {
    title: STRINGS.device.disconnectTitle,
    body: STRINGS.device.disconnectBody,
    confirmLabel: STRINGS.device.disconnect,
  },
  endDemo: {
    title: STRINGS.device.endDemoTitle,
    body: STRINGS.device.endDemoBody,
    confirmLabel: STRINGS.device.endDemo,
  },
};

const CONFIRM_KINDS = Object.keys(COPY) as ConfirmKind[];

export interface DeviceDialogsProps {
  dialog: DeviceDialog;
  onClose: () => void;
  onDisconnect: () => void;
  onEndDemo: () => void;
}

export const DeviceDialogs = ({
  dialog,
  onClose,
  onDisconnect,
  onEndDemo,
}: DeviceDialogsProps) => {
  const actions: Record<ConfirmKind, () => void> = {
    disconnect: onDisconnect,
    endDemo: onEndDemo,
  };
  return (
    <>
      {CONFIRM_KINDS.map((kind) => (
        <ConfirmDialog
          key={kind}
          visible={dialog === kind}
          {...COPY[kind]}
          cancelLabel={STRINGS.device.cancel}
          onConfirm={() => {
            onClose();
            actions[kind]();
          }}
          onCancel={onClose}
        />
      ))}
    </>
  );
};
