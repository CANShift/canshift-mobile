import { Modal, StyleSheet, Text, View } from "react-native";
import { useDeviceStore } from "../stores/device.store";
import { backToScan, retryReconnect } from "../services/session-exit";
import { STRINGS } from "../strings";
import { TouchTarget, UiColors, UiRadius } from "../theme/ui-tokens";
import { BigButton } from "./buttons/BigButton";

const TRY_AGAIN_HEIGHT = 60;

const ReconnectFailedDialog = () => {
  const dashName =
    useDeviceStore((s) => s.lastDashName) ?? STRINGS.connect.theDash;
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={backToScan}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={styles.scrim}>
        <View
          style={styles.card}
          accessibilityViewIsModal
          accessibilityRole="alert"
        >
          <Text style={styles.title}>
            {STRINGS.connect.reconnectFailedTitle(dashName)}
          </Text>
          <Text style={styles.body}>{STRINGS.connect.reconnectFailedBody}</Text>
          <BigButton
            label={STRINGS.connect.tryAgain}
            tone="light"
            height={TRY_AGAIN_HEIGHT}
            onPress={() => void retryReconnect()}
          />
          <BigButton
            label={STRINGS.connect.scanForDashes}
            tone="outline"
            height={TouchTarget.driving}
            onPress={backToScan}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#000000B8",
  },
  card: {
    padding: 22,
    gap: 14,
    borderRadius: UiRadius.sheet,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
  },
  title: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "700",
    color: UiColors.text,
  },
  body: { fontSize: 17, lineHeight: 25, color: UiColors.textSecondary },
});

export default ReconnectFailedDialog;
