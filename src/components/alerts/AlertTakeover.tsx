import { Modal, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UiColors } from "../../theme/ui-tokens";
import { alertActions } from "../../services/alert-actions";
import { useAlertFromDash, useAlertViews } from "../../hooks/use-alerts";
import { AlertKicker } from "./AlertKicker";
import { AlertFocus } from "./AlertFocus";
import { AlertStack } from "./AlertStack";

const TakeoverBody = () => {
  const { takeover } = useAlertViews();
  const [first] = takeover;
  if (first === undefined) return null;
  if (takeover.length === 1) {
    return (
      <AlertFocus
        entry={first}
        onAcknowledge={() => {
          alertActions.acknowledge(first.source);
        }}
        onMute={() => {
          alertActions.muteAll([first.source]);
        }}
      />
    );
  }
  return (
    <AlertStack
      entries={takeover}
      onAcknowledge={alertActions.acknowledge}
      onMuteAll={() => {
        alertActions.muteAll(takeover.map((entry) => entry.source));
      }}
    />
  );
};

export const AlertTakeover = () => {
  const insets = useSafeAreaInsets();
  const count = useAlertViews().takeover.length;
  const fromDash = useAlertFromDash();
  return (
    <Modal
      visible={count > 0}
      animationType="none"
      presentationStyle="overFullScreen"
      transparent={false}
      statusBarTranslucent
      supportedOrientations={["portrait", "landscape"]}
    >
      <View
        style={[
          styles.field,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 16,
            paddingLeft: insets.left + 20,
            paddingRight: insets.right + 20,
          },
        ]}
        accessibilityViewIsModal
      >
        <AlertKicker count={count} fromDash={fromDash} />
        <TakeoverBody />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  field: { flex: 1, gap: 14, backgroundColor: UiColors.primaryBtn },
});
