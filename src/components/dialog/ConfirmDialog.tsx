import { Modal, StyleSheet, Text, View } from "react-native";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import { ConfirmDialogActions } from "./ConfirmDialogActions";

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  visible,
  title,
  body,
  ...actions
}: ConfirmDialogProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={actions.onCancel}
    supportedOrientations={["portrait", "landscape"]}
  >
    <View style={styles.scrim}>
      <View
        style={styles.card}
        accessibilityViewIsModal
        accessibilityRole="alert"
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <ConfirmDialogActions {...actions} />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#000000AA",
  },
  card: {
    padding: 20,
    gap: 12,
    borderRadius: UiRadius.sheet,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
  },
  title: { fontSize: 19, fontWeight: "700", color: UiColors.text },
  body: { fontSize: 15, lineHeight: 21, color: UiColors.textSecondary },
});
