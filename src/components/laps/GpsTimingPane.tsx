import { useGpsTiming } from "../../hooks/use-gps-timing";
import { GpsSetup } from "./GpsSetup";
import { GpsRunning } from "./GpsRunning";

export interface GpsTimingPaneProps {
  visible: boolean;
}

export const GpsTimingPane = ({ visible }: GpsTimingPaneProps) => {
  const gps = useGpsTiming(visible);
  return gps.recording ? <GpsRunning gps={gps} /> : <GpsSetup gps={gps} />;
};
