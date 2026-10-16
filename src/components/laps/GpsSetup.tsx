import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import type { GpsTimingModel } from "../../hooks/use-gps-timing";
import { BigButton } from "../buttons/BigButton";
import { GpsFixCard } from "./GpsFixCard";
import { StartLineCard } from "./StartLineCard";
import { LapLines } from "./LapLines";
import { LapsSplit } from "./LapsSplit";

const START_HEIGHT = 64;

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
          <View style={styles.start}>
            <BigButton
              label={STRINGS.laps.startTrackMode}
              tone="primary"
              height={START_HEIGHT}
              onPress={gps.start}
              disabled={!canStart}
            />
            {canStart ? null : (
              <Text style={styles.hint}>{STRINGS.laps.needsFixAndLine}</Text>
            )}
          </View>
        </>
      }
    />
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 15, color: UiColors.textMuted },
  start: { gap: 8 },
  hint: { fontSize: 14, color: UiColors.textMuted, textAlign: "center" },
});
