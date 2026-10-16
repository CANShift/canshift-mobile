import { StyleSheet, View } from "react-native";
import { BigButton, type BigButtonTone } from "../buttons/BigButton";

const PRIMARY_HEIGHT = 60;
const SECONDARY_HEIGHT = 52;

export interface ScanAction {
  label: string;
  onPress: () => void;
  tone?: BigButtonTone;
  disabled?: boolean;
}

export interface ScanActionsProps {
  primary: ScanAction;
  secondary?: ScanAction;
}

export const ScanActions = ({ primary, secondary }: ScanActionsProps) => (
  <View style={styles.actions}>
    <BigButton
      label={primary.label}
      tone={primary.tone ?? "primary"}
      height={PRIMARY_HEIGHT}
      onPress={primary.onPress}
      disabled={primary.disabled ?? false}
    />
    {secondary === undefined ? null : (
      <BigButton
        label={secondary.label}
        tone={secondary.tone ?? "outline"}
        height={SECONDARY_HEIGHT}
        onPress={secondary.onPress}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  actions: { marginTop: "auto", gap: 10 },
});
