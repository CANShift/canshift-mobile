import { STRINGS } from "../../strings";
import type { GpsTimingModel } from "../../hooks/use-gps-timing";
import { BigButton } from "../buttons/BigButton";
import { StopTrackModeDialog } from "./StopTrackModeDialog";
import { TrackRun } from "./TrackRun";
import { BestLastRow } from "./BestLastRow";
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
          <BestLastRow laps={gps.laps} />
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
    <StopTrackModeDialog gps={gps} />
  </>
);
