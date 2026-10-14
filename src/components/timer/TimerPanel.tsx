import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Spacing } from "../../theme";
import TimerDisplay from "./TimerDisplay";
import TimerControls from "./TimerControls";
import LapList from "../lap/LapList";
import { timerLapRows } from "../lap/lap-rows";
import { useTimerStore } from "../../stores/timer.store";
import {
  acknowledgePersistFailure,
  hydrateTimerSessions,
  useTimerSessionsStore,
} from "../../stores/timer-sessions.store";
import SessionPersistWarning from "./SessionPersistWarning";
import { timerControl } from "../../services/timer-control";
import { useTimerElapsed } from "../../hooks/use-timer-elapsed";

const TIMER_EMPTY_LAPS = "No laps yet — tap Lap while the timer is running.";

export const TimerPanel = () => {
  const status = useTimerStore((s) => s.status);
  const laps = useTimerStore((s) => s.laps);
  const deviceSynced = useTimerStore((s) => s.deviceSynced);
  const elapsedMs = useTimerElapsed(status);
  const persistFailed = useTimerSessionsStore((s) => s.persistFailed);
  const lapRows = useMemo(() => timerLapRows(laps), [laps]);

  useEffect(() => {
    void hydrateTimerSessions();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      {persistFailed && (
        <SessionPersistWarning onDismiss={acknowledgePersistFailure} />
      )}
      <TimerDisplay
        elapsedMs={elapsedMs}
        status={status}
        deviceSynced={deviceSynced}
      />
      <TimerControls
        status={status}
        onStart={timerControl.start}
        onPause={timerControl.pause}
        onResume={timerControl.resume}
        onReset={timerControl.reset}
        onLap={timerControl.lap}
      />
      <LapList rows={lapRows} emptyText={TIMER_EMPTY_LAPS} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  body: { padding: Spacing.lg, gap: Spacing.md },
});
