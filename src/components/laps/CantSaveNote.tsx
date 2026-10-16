import { Pressable, StyleSheet, Text } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";

export interface CantSaveNoteProps {
  onDismiss: () => void;
}

export const CantSaveNote = ({ onDismiss }: CantSaveNoteProps) => (
  <Pressable
    style={styles.note}
    onPress={onDismiss}
    accessibilityRole="alert"
    accessibilityHint={STRINGS.banners.dismiss}
  >
    <Text style={styles.text}>{STRINGS.laps.cantSave}</Text>
    <Glyph name="close" size={18} color={UiColors.warningTextStrong} />
  </Pressable>
);

const styles = StyleSheet.create({
  note: {
    minHeight: 44,
    padding: 12,
    borderRadius: UiRadius.control,
    borderWidth: 1.5,
    borderColor: UiColors.warning,
    backgroundColor: UiColors.warningBg,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: { flex: 1, fontSize: 14, lineHeight: 19, color: UiColors.warningText },
});
