import { STRINGS } from "../../strings";
import { ConfirmDialog } from "../dialog/ConfirmDialog";

interface ClearLogDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ClearLogDialog = ({
  visible,
  onConfirm,
  onCancel,
}: ClearLogDialogProps) => (
  <ConfirmDialog
    visible={visible}
    title={STRINGS.console.clearTitle}
    body={STRINGS.console.clearBody}
    confirmLabel={STRINGS.console.clear}
    cancelLabel={STRINGS.console.cancel}
    onConfirm={onConfirm}
    onCancel={onCancel}
  />
);
