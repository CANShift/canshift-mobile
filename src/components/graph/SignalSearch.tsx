import { StyleSheet, TextInput, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";

export interface SignalSearchProps {
  query: string;
  onQuery: (query: string) => void;
}

export const SignalSearch = ({ query, onQuery }: SignalSearchProps) => (
  <View style={styles.field}>
    <Glyph name="search" size={18} color={UiColors.textMuted} strokeWidth={2} />
    <TextInput
      style={styles.input}
      value={query}
      onChangeText={onQuery}
      placeholder={STRINGS.graph.searchSignals}
      placeholderTextColor={UiColors.textMuted}
      accessibilityLabel={STRINGS.graph.searchSignals}
      autoCorrect={false}
      autoCapitalize="none"
    />
  </View>
);

const styles = StyleSheet.create({
  field: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: UiRadius.tile,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.bg,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: { flex: 1, height: 44, fontSize: 16, color: UiColors.text },
});
