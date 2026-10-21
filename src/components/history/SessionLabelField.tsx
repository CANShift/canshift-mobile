import { StyleSheet, TextInput } from "react-native";
import { HISTORY_STRINGS } from "../../history-strings";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";
import { MAX_LABEL_LENGTH } from "../../lib/session-label";

export interface SessionLabelFieldProps {
  label: string;
  onRename: (label: string) => void;
}

export const SessionLabelField = ({
  label,
  onRename,
}: SessionLabelFieldProps) => (
  <TextInput
    style={styles.field}
    defaultValue={label}
    placeholder={HISTORY_STRINGS.labelPlaceholder}
    placeholderTextColor={UiColors.textMuted}
    maxLength={MAX_LABEL_LENGTH}
    returnKeyType="done"
    accessibilityLabel={HISTORY_STRINGS.labelField}
    onEndEditing={(event) => {
      onRename(event.nativeEvent.text);
    }}
  />
);

const styles = StyleSheet.create({
  field: {
    minHeight: TouchTarget.driving,
    paddingHorizontal: 14,
    borderRadius: UiRadius.control,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
    fontSize: 20,
    fontWeight: "700",
    color: UiColors.text,
  },
});
