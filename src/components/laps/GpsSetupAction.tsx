import { StyleSheet, Text, View } from "react-native";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";
import type { GpsSetupView } from "../../lib/gps-setup";
import { BigButton } from "../buttons/BigButton";

interface GpsSetupActionProps {
  view: GpsSetupView;
  onPress: () => void;
}

export const GpsSetupAction = ({ view, onPress }: GpsSetupActionProps) => (
  <View style={styles.action}>
    {view.hint === null ? null : <Text style={styles.hint}>{view.hint}</Text>}
    <BigButton
      label={view.label}
      tone="primary"
      height={TouchTarget.glove}
      onPress={onPress}
      disabled={!view.enabled}
    />
  </View>
);

const styles = StyleSheet.create({
  action: { gap: 10 },
  hint: {
    fontSize: 15,
    lineHeight: 21,
    color: UiColors.textMuted,
    textAlign: "center",
  },
});
