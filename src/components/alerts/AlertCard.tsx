import { StyleSheet, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";
import type { AlertEntry } from "../../lib/alert-model";
import { BigButton } from "../buttons/BigButton";
import { AlertCardDetails } from "./AlertCardDetails";

export interface AlertCardProps {
  entry: AlertEntry;
  onAcknowledge: () => void;
}

export const AlertCard = ({ entry, onAcknowledge }: AlertCardProps) => (
  <View style={styles.card}>
    <AlertCardDetails entry={entry} />
    <BigButton
      label={STRINGS.alert.acknowledge}
      tone="light"
      height={TouchTarget.glove}
      onPress={onAcknowledge}
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 8,
    borderRadius: UiRadius.sheet,
    backgroundColor: UiColors.alertPanel,
  },
});
