import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { BigButton } from "../buttons/BigButton";

const START_HEIGHT = 64;

interface StartTrackModeButtonProps {
  canStart: boolean;
  onStart: () => void;
}

export const StartTrackModeButton = ({
  canStart,
  onStart,
}: StartTrackModeButtonProps) => (
  <View style={styles.start}>
    <BigButton
      label={STRINGS.laps.startTrackMode}
      tone="primary"
      height={START_HEIGHT}
      onPress={onStart}
      disabled={!canStart}
    />
    {canStart ? null : (
      <Text style={styles.hint}>{STRINGS.laps.needsFixAndLine}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  start: { gap: 8 },
  hint: { fontSize: 14, color: UiColors.textMuted, textAlign: "center" },
});
