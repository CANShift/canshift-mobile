import { Pressable, StyleSheet, Text, View } from "react-native";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";

interface ConfirmDialogActionsProps {
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialogActions = ({
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogActionsProps) => (
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
);

const styles = StyleSheet.create({
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
