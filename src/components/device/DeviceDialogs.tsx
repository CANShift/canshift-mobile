import { STRINGS } from "../../strings";
import type { DeviceDialog } from "../../hooks/use-device-screen";
import { ConfirmDialog } from "../dialog/ConfirmDialog";

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
}: DeviceDialogsProps) => (
  <>
    <ConfirmDialog
      visible={dialog === "disconnect"}
      title={STRINGS.device.disconnectTitle}
      body={STRINGS.device.disconnectBody}
      confirmLabel={STRINGS.device.disconnect}
      cancelLabel={STRINGS.device.cancel}
      onConfirm={() => {
        onClose();
        onDisconnect();
      }}
      onCancel={onClose}
    />
    <ConfirmDialog
      visible={dialog === "endDemo"}
      title={STRINGS.device.endDemoTitle}
      body={STRINGS.device.endDemoBody}
      confirmLabel={STRINGS.device.endDemo}
      cancelLabel={STRINGS.device.cancel}
      onConfirm={() => {
        onClose();
        onEndDemo();
      }}
      onCancel={onClose}
    />
  </>
);
