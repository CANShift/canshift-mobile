import { StyleSheet, TextInput } from "react-native";
import { CIRCUIT_STRINGS } from "../../../circuit-strings";
import { MAX_CIRCUIT_NAME_LENGTH } from "../../../stores/circuits.store";
import type { CircuitNameEditor } from "../../../hooks/use-circuit-name-editor";
import { TouchTarget, UiColors, UiRadius } from "../../../theme/ui-tokens";

export interface CircuitNameFieldProps {
  editor: CircuitNameEditor;
}

export const CircuitNameField = ({ editor }: CircuitNameFieldProps) => (
  <TextInput
    style={styles.input}
    value={editor.draft}
    onChangeText={editor.setDraft}
    onSubmitEditing={editor.submitName}
    maxLength={MAX_CIRCUIT_NAME_LENGTH}
    accessibilityLabel={CIRCUIT_STRINGS.nameLabel}
    placeholder={CIRCUIT_STRINGS.nameLabel}
    placeholderTextColor={UiColors.textMuted}
    returnKeyType="done"
    selectTextOnFocus
    autoFocus
  />
);

const styles = StyleSheet.create({
  input: {
    minHeight: TouchTarget.driving,
    paddingHorizontal: 14,
    borderRadius: UiRadius.control,
    borderWidth: 1,
    borderColor: UiColors.borderStrong,
    backgroundColor: UiColors.surface2,
    fontSize: 17,
    color: UiColors.text,
  },
});
