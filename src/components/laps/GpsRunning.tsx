import { STRINGS } from "../../strings";
import type { GpsTimingModel } from "../../hooks/use-gps-timing";
import { BigButton } from "../buttons/BigButton";
import { ConfirmDialog } from "../dialog/ConfirmDialog";
import { TrackRun } from "./TrackRun";
import { StatTiles } from "./StatTiles";
import { LapLines } from "./LapLines";
import { LapsSplit } from "./LapsSplit";

const STOP_HEIGHT = 60;

export interface GpsRunningProps {
  gps: GpsTimingModel;
}

export const GpsRunning = ({ gps }: GpsRunningProps) => (
  <>
    <LapsSplit
      top={
        <>
          <TrackRun laps={gps.laps} currentLapMs={gps.currentLapMs} />
          <StatTiles laps={gps.laps} />
        </>
      }
      bottom={
        <>
          <LapLines laps={gps.laps} />
          <BigButton
            label={STRINGS.laps.stopTrackMode}
            tone="outline"
            height={STOP_HEIGHT}
            onPress={gps.askStop}
          />
        </>
      }
    />
    <ConfirmDialog
      visible={gps.confirmingStop}
      title={STRINGS.laps.stopTrackModeTitle}
      body={STRINGS.laps.stopTrackModeBody}
      confirmLabel={STRINGS.laps.stop}
      cancelLabel={STRINGS.laps.cancel}
      onConfirm={gps.confirmStop}
      onCancel={gps.cancelStop}
    />
  </>
);
