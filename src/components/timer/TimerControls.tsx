import React from "react";
import { View } from "react-native";
import { Button } from "../ui";
import type { TimerStatus } from "../../stores/timer.store";

export interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onLap: () => void;
}

const PRIMARY_LABEL: Record<TimerStatus, string> = {
  idle: "Start",
  running: "Pause",
  paused: "Resume",
};

const TimerControls = ({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onLap,
}: TimerControlsProps) => {
  const primaryAction: Record<TimerStatus, () => void> = {
    idle: onStart,
    running: onPause,
    paused: onResume,
  };

  return (
    <View className="gap-2">
      <View className="flex-row gap-2">
        <Button
          className="flex-1"
          onPress={primaryAction[status]}
          accessibilityLabel={`${PRIMARY_LABEL[status]} timer`}
        >
          {PRIMARY_LABEL[status]}
        </Button>
        <Button
          className="flex-1"
          variant="secondary"
          disabled={status !== "running"}
          onPress={onLap}
          accessibilityLabel="Capture lap"
        >
          Lap
        </Button>
      </View>
      <Button
        variant="outline"
        disabled={status === "idle"}
        onPress={onReset}
        accessibilityLabel="Reset timer"
      >
        Reset
      </Button>
    </View>
  );
};

export default React.memo(TimerControls);
