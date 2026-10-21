import type { GpsTimingModel } from "../../hooks/use-gps-timing";
import { GpsFixCard } from "./GpsFixCard";
import { StartLineRow } from "./StartLineRow";
import { SetupLaps } from "./SetupLaps";
import { LapsSplit } from "./LapsSplit";
import { GpsSetupAction } from "./GpsSetupAction";
import { CircuitsSheet } from "./circuits/CircuitsSheet";
import { CircuitNameDialog } from "./circuits/CircuitNameDialog";

export interface GpsSetupProps {
  gps: GpsTimingModel;
}

const LineRow = ({ gps }: GpsSetupProps) => (
  <StartLineRow
    kind={gps.circuits.rowKind}
    armedName={gps.circuits.armedName}
    onReset={gps.resetLine}
    onSetHere={gps.setLine}
    onSave={gps.circuits.startSave}
    onManage={gps.circuits.openSheet}
  />
);

export const GpsSetup = ({ gps }: GpsSetupProps) => (
  <>
    <LapsSplit
      top={
        <>
          <GpsFixCard fix={gps.fix} accuracyM={gps.accuracyM} />
          {gps.view.showsLine ? <LineRow gps={gps} /> : null}
        </>
      }
      bottom={
        <>
          <SetupLaps laps={gps.laps} />
          <GpsSetupAction view={gps.view} onPress={gps[gps.view.action]} />
        </>
      }
    />
    <CircuitsSheet model={gps.circuits} />
    <CircuitNameDialog editor={gps.circuits} kind="save" />
  </>
);
