import { CIRCUIT_STRINGS } from "../../../circuit-strings";
import type { CircuitDelete } from "../../../hooks/use-circuit-delete";
import { ConfirmDialog } from "../../dialog/ConfirmDialog";

export interface DeleteCircuitDialogProps {
  model: CircuitDelete;
}

export const DeleteCircuitDialog = ({ model }: DeleteCircuitDialogProps) => (
  <ConfirmDialog
    visible={model.deleting !== null}
    title={CIRCUIT_STRINGS.deleteTitle(model.deleting?.name ?? "")}
    body={CIRCUIT_STRINGS.deleteBody}
    confirmLabel={CIRCUIT_STRINGS.delete}
    cancelLabel={CIRCUIT_STRINGS.cancel}
    onConfirm={model.confirmDelete}
    onCancel={model.cancelDelete}
  />
);
