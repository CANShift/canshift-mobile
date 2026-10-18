import { StyleSheet, Text } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import type { GpsTimingModel } from "../../hooks/use-gps-timing";
import { GpsFixCard } from "./GpsFixCard";
import { StartLineCard } from "./StartLineCard";
import { LapLines } from "./LapLines";
import { LapsSplit } from "./LapsSplit";
import { StartTrackModeButton } from "./StartTrackModeButton";

export interface GpsSetupProps {
  gps: GpsTimingModel;
}

export const GpsSetup = ({ gps }: GpsSetupProps) => {
  const canStart = gps.fix === "ready" && gps.lineSet;
  return (
    <LapsSplit
      top={
        <>
          <GpsFixCard fix={gps.fix} accuracyM={gps.accuracyM} />
          <StartLineCard
            lineSet={gps.lineSet}
            canSet={gps.fix === "ready"}
            onSet={gps.setLine}
            onReset={gps.resetLine}
          />
        </>
      }
      bottom={
        <>
          <Text style={styles.label}>{STRINGS.laps.laps}</Text>
          <LapLines laps={gps.laps} />
          <StartTrackModeButton canStart={canStart} onStart={gps.start} />
        </>
      }
    />
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 15, color: UiColors.textMuted },
});
