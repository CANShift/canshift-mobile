import { StyleSheet, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { BigButton } from "../buttons/BigButton";

const ACK_HEIGHT = 96;

interface AlertFocusActionsProps {
  onAcknowledge: () => void;
  onMute: () => void;
}

export const AlertFocusActions = ({
  onAcknowledge,
  onMute,
}: AlertFocusActionsProps) => (
  <View style={styles.actions}>
    <BigButton
      label={STRINGS.alert.acknowledge}
      tone="light"
      height={ACK_HEIGHT}
      onPress={onAcknowledge}
    />
    <BigButton
      label={STRINGS.alert.mute}
      tone="onAlert"
      height={TouchTarget.driving + 8}
      onPress={onMute}
      glyph="mute"
    />
  </View>
);

const styles = StyleSheet.create({
  actions: { justifyContent: "flex-end", gap: 10, minWidth: 260 },
});
