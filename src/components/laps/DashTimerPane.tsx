import { timerControl } from "../../services/timer-control";
import {
  TIMER_VIEWS,
  timerSource,
  type TimerAction,
} from "../../lib/timer-view";
import { useDashTimer, type DashTimerModel } from "../../hooks/use-dash-timer";
import { TimerActions } from "./TimerActions";
import { LapLines } from "./LapLines";
import { LapsSplit } from "./LapsSplit";
import { DashTimerTop } from "./DashTimerTop";
import { ResetLapsDialog } from "./ResetLapsDialog";

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
  return (
    <>
      <LapsSplit
        top={<DashTimerTop timer={timer} view={view} source={source} />}
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
      <ResetLapsDialog timer={timer} />
    </>
  );
};
