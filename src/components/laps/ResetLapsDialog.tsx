import { STRINGS } from "../../strings";
import type { DashTimerModel } from "../../hooks/use-dash-timer";
import { ConfirmDialog } from "../dialog/ConfirmDialog";

interface ResetLapsDialogProps {
  timer: DashTimerModel;
}

export const ResetLapsDialog = ({ timer }: ResetLapsDialogProps) => (
  <ConfirmDialog
    visible={timer.confirmingReset}
    title={STRINGS.laps.resetTitle}
    body={STRINGS.laps.resetBody(timer.laps.length)}
    confirmLabel={STRINGS.laps.reset}
    cancelLabel={STRINGS.laps.cancel}
    onConfirm={timer.confirmReset}
    onCancel={timer.cancelReset}
  />
);
