import type { GpsTimingModel } from "../../hooks/use-gps-timing";
import { GPS_SETUP_VIEWS } from "../../lib/gps-setup";
import { GpsFixCard } from "./GpsFixCard";
import { StartLineRow } from "./StartLineRow";
import { SetupLaps } from "./SetupLaps";
import { LapsSplit } from "./LapsSplit";
import { GpsSetupAction } from "./GpsSetupAction";

export interface GpsSetupProps {
  gps: GpsTimingModel;
}

export const GpsSetup = ({ gps }: GpsSetupProps) => {
  const view = GPS_SETUP_VIEWS[gps.step];
  return (
    <LapsSplit
      top={
        <>
          <GpsFixCard fix={gps.fix} accuracyM={gps.accuracyM} />
          {view.showsLine ? (
            <StartLineRow lineSet={gps.lineSet} onReset={gps.resetLine} />
          ) : null}
        </>
      }
      bottom={
        <>
          <SetupLaps laps={gps.laps} />
          <GpsSetupAction view={view} onPress={gps[view.action]} />
        </>
      }
    />
  );
};
