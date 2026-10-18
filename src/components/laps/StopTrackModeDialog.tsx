import { STRINGS } from "../../strings";
import type { GpsTimingModel } from "../../hooks/use-gps-timing";
import { ConfirmDialog } from "../dialog/ConfirmDialog";

interface StopTrackModeDialogProps {
  gps: GpsTimingModel;
}

export const StopTrackModeDialog = ({ gps }: StopTrackModeDialogProps) => (
  <ConfirmDialog
    visible={gps.confirmingStop}
    title={STRINGS.laps.stopTrackModeTitle}
    body={STRINGS.laps.stopTrackModeBody}
    confirmLabel={STRINGS.laps.stop}
    cancelLabel={STRINGS.laps.cancel}
    onConfirm={gps.confirmStop}
    onCancel={gps.cancelStop}
  />
);
