import { HISTORY_STRINGS } from "../../history-strings";
import type { SessionDetailModel } from "../../hooks/use-session-detail";
import { ConfirmDialog } from "../dialog/ConfirmDialog";

interface DeleteSessionDialogProps {
  detail: SessionDetailModel;
}

export const DeleteSessionDialog = ({ detail }: DeleteSessionDialogProps) => (
  <ConfirmDialog
    visible={detail.confirmingDelete}
    title={HISTORY_STRINGS.deleteTitle}
    body={HISTORY_STRINGS.deleteBody(detail.session.laps.length)}
    confirmLabel={HISTORY_STRINGS.delete}
    cancelLabel={HISTORY_STRINGS.cancel}
    onConfirm={detail.confirmDelete}
    onCancel={detail.cancelDelete}
  />
);
