import { StyleSheet, TextInput, View } from "react-native";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const SearchField = ({
  value,
  onChange,
  placeholder,
}: SearchFieldProps) => (
  <View style={styles.field}>
    <Glyph name="search" size={18} color={UiColors.textMuted} strokeWidth={2} />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={UiColors.textMuted}
      accessibilityLabel={placeholder}
      autoCorrect={false}
      autoCapitalize="none"
    />
  </View>
);

const styles = StyleSheet.create({
  field: {
    flex: 1,
    minHeight: TouchTarget.min,
    paddingHorizontal: 12,
    borderRadius: UiRadius.control,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: TouchTarget.min,
    fontSize: 15,
    color: UiColors.text,
  },
});
