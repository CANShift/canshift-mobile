import { StyleSheet, Text } from "react-native";
import { UiColors } from "../../theme/ui-tokens";
import type { TimerSource, TimerView } from "../../lib/timer-view";
import type { DashTimerModel } from "../../hooks/use-dash-timer";
import { TimerStatusRow } from "./TimerStatusRow";
import { CantSaveNote } from "./CantSaveNote";
import { Chrono } from "./Chrono";

interface DashTimerTopProps {
  timer: DashTimerModel;
  view: TimerView;
  source: TimerSource;
}

export const DashTimerTop = ({ timer, view, source }: DashTimerTopProps) => {
  const lapNumber = timer.status === "idle" ? null : timer.laps.length + 1;
  return (
    <>
      <TimerStatusRow view={view} source={source} lapNumber={lapNumber} />
      {timer.persistFailed ? (
        <CantSaveNote onDismiss={timer.dismissPersistFailure} />
      ) : null}
      <Chrono ms={timer.elapsedMs} color={view.chronoColor} />
      <Text style={styles.hint}>{source.hint}</Text>
    </>
  );
};

const styles = StyleSheet.create({
  hint: { fontSize: 15, lineHeight: 21, color: UiColors.textMuted },
});
