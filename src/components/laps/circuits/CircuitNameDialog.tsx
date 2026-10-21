import { Modal, StyleSheet, Text, View } from "react-native";
import { CIRCUIT_STRINGS } from "../../../circuit-strings";
import type { CircuitNameEditor } from "../../../hooks/use-circuit-name-editor";
import { UiColors, UiRadius } from "../../../theme/ui-tokens";
import { ConfirmDialogActions } from "../../dialog/ConfirmDialogActions";
import { CircuitNameField } from "./CircuitNameField";

export interface CircuitNameDialogProps {
  editor: CircuitNameEditor;
  kind: "save" | "rename";
}

const TITLES: Record<CircuitNameDialogProps["kind"], string> = {
  save: CIRCUIT_STRINGS.saveTitle,
  rename: CIRCUIT_STRINGS.renameTitle,
};

export const CircuitNameDialog = ({ editor, kind }: CircuitNameDialogProps) => (
  <Modal
    visible={editor.edit?.kind === kind}
    transparent
    animationType="fade"
    onRequestClose={editor.cancelName}
    supportedOrientations={["portrait", "landscape"]}
  >
    <View style={styles.scrim}>
      <View style={styles.card} accessibilityViewIsModal>
        <Text style={styles.title}>{TITLES[kind]}</Text>
        <CircuitNameField editor={editor} />
        <ConfirmDialogActions
          confirmLabel={CIRCUIT_STRINGS.save}
          cancelLabel={CIRCUIT_STRINGS.cancel}
          onConfirm={editor.submitName}
          onCancel={editor.cancelName}
        />
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
});
