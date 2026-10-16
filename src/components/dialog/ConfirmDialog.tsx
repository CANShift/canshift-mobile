import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";

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
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}
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
        <View style={styles.actions}>
          <Pressable
            style={[styles.button, styles.cancel]}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
          >
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.confirm]}
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
          >
            <Text style={styles.confirmText}>{confirmLabel}</Text>
          </Pressable>
        </View>
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
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  button: {
    flex: 1,
    minHeight: TouchTarget.driving,
    borderRadius: UiRadius.control,
    alignItems: "center",
    justifyContent: "center",
  },
  cancel: { borderWidth: 1, borderColor: UiColors.border },
  confirm: { backgroundColor: UiColors.primaryBtn },
  cancelText: { fontSize: 16, color: UiColors.text },
  confirmText: { fontSize: 16, fontWeight: "700", color: UiColors.onPrimary },
});
