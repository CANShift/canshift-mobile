import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";
import { BottomSheet } from "../sheet/BottomSheet";
import { BigButton } from "../buttons/BigButton";

export interface PairingSheetProps {
  dashName: string | null;
  onCancel: () => void;
}

export const PairingSheet = ({ dashName, onCancel }: PairingSheetProps) => (
  <BottomSheet
    visible={dashName !== null}
    title={STRINGS.connect.pairingTitle}
    subtitle={STRINGS.connect.connectingTo(dashName ?? "")}
    onClose={onCancel}
  >
    <Text style={styles.body}>{STRINGS.connect.pairingBody}</Text>
    <View style={styles.waiting} accessibilityLiveRegion="polite">
      <ActivityIndicator color={UiColors.text} />
      <Text style={styles.waitingText}>{STRINGS.connect.pairingWaiting}</Text>
    </View>
    <BigButton
      label={STRINGS.connect.cancel}
      tone="outline"
      height={TouchTarget.driving}
      onPress={onCancel}
    />
  </BottomSheet>
);

const styles = StyleSheet.create({
  body: { fontSize: 17, lineHeight: 25, color: UiColors.textSecondary },
  waiting: { flexDirection: "row", alignItems: "center", gap: 10 },
  waitingText: { fontSize: 16, color: UiColors.textSecondary },
});
