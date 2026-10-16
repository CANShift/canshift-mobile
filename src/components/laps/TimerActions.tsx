import { StyleSheet, View } from "react-native";
import { TouchTarget } from "../../theme/ui-tokens";
import type { TimerAction, TimerButton, TimerView } from "../../lib/timer-view";
import { BigButton } from "../buttons/BigButton";

const PRIMARY_HEIGHT = 96;
const SECONDARY_HEIGHT = 60;

export interface TimerActionsProps {
  view: TimerView;
  onAction: (action: TimerAction) => void;
}

const ActionFor = ({
  button,
  height,
  onAction,
}: {
  button: TimerButton;
  height: number;
  onAction: (action: TimerAction) => void;
}) => (
  <BigButton
    label={button.label}
    tone={button.tone}
    height={height}
    onPress={() => {
      onAction(button.action);
    }}
    {...(button.glyph === undefined ? {} : { glyph: button.glyph })}
  />
);

export const TimerActions = ({ view, onAction }: TimerActionsProps) => (
  <View style={styles.actions}>
    <ActionFor
      button={view.primary}
      height={PRIMARY_HEIGHT}
      onAction={onAction}
    />
    {view.secondary === null ? null : (
      <ActionFor
        button={view.secondary}
        height={Math.max(SECONDARY_HEIGHT, TouchTarget.driving)}
        onAction={onAction}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  actions: { gap: 12 },
});
