import { StyleSheet, Text } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { timerControl } from "../../services/timer-control";
import {
  TIMER_VIEWS,
  timerSource,
  type TimerAction,
} from "../../lib/timer-view";
import { useDashTimer, type DashTimerModel } from "../../hooks/use-dash-timer";
import { ConfirmDialog } from "../dialog/ConfirmDialog";
import { TimerStatusRow } from "./TimerStatusRow";
import { CantSaveNote } from "./CantSaveNote";
import { TimerActions } from "./TimerActions";
import { LapLines } from "./LapLines";
import { LapsSplit } from "./LapsSplit";
import { Chrono } from "./Chrono";

const actionsFor = (
  timer: DashTimerModel,
): Record<TimerAction, () => void> => ({
  start: timerControl.start,
  pause: timerControl.pause,
  resume: timerControl.resume,
  lap: timerControl.lap,
  askReset: timer.askReset,
});

export const DashTimerPane = () => {
  const timer = useDashTimer();
  const view = TIMER_VIEWS[timer.status];
  const source = timerSource(timer.synced);
  const lapNumber = timer.status === "idle" ? null : timer.laps.length + 1;
  return (
    <>
      <LapsSplit
        top={
          <>
            <TimerStatusRow view={view} source={source} lapNumber={lapNumber} />
            {timer.persistFailed ? (
              <CantSaveNote onDismiss={timer.dismissPersistFailure} />
            ) : null}
            <Chrono ms={timer.elapsedMs} color={view.chronoColor} />
            <Text style={styles.hint}>{source.hint}</Text>
          </>
        }
        bottom={
          <>
            <LapLines laps={timer.laps} />
            <TimerActions
              view={view}
              onAction={(action) => {
                actionsFor(timer)[action]();
              }}
            />
          </>
        }
      />
      <ConfirmDialog
        visible={timer.confirmingReset}
        title={STRINGS.laps.resetTitle}
        body={STRINGS.laps.resetBody(timer.laps.length)}
        confirmLabel={STRINGS.laps.reset}
        cancelLabel={STRINGS.laps.cancel}
        onConfirm={timer.confirmReset}
        onCancel={timer.cancelReset}
      />
    </>
  );
};

const styles = StyleSheet.create({
  hint: { fontSize: 15, lineHeight: 21, color: UiColors.textMuted },
});
