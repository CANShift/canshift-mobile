import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";
import { BigButton } from "../buttons/BigButton";

export interface StartLineCardProps {
  lineSet: boolean;
  canSet: boolean;
  onSet: () => void;
  onReset: () => void;
}

const LineState = ({ lineSet }: { lineSet: boolean }) =>
  lineSet ? (
    <View style={styles.state}>
      <Glyph name="check" size={16} color={UiColors.success} />
      <Text style={styles.set}>{STRINGS.laps.lineSet}</Text>
    </View>
  ) : (
    <Text style={styles.notSet}>{STRINGS.laps.lineNotSet}</Text>
  );

export const StartLineCard = ({
  lineSet,
  canSet,
  onSet,
  onReset,
}: StartLineCardProps) => (
  <View style={styles.card}>
    <View style={styles.head}>
      <Text style={styles.title}>{STRINGS.laps.line}</Text>
      <LineState lineSet={lineSet} />
    </View>
    {lineSet ? null : (
      <Text style={styles.hint}>{STRINGS.laps.setLineHint}</Text>
    )}
    <BigButton
      label={lineSet ? STRINGS.laps.resetLine : STRINGS.laps.setLineHere}
      tone="outline"
      height={TouchTarget.driving}
      onPress={lineSet ? onReset : onSet}
      disabled={!lineSet && !canSet}
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 12,
    borderRadius: UiRadius.card,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 17, fontWeight: "600", color: UiColors.text },
  state: { flexDirection: "row", alignItems: "center", gap: 6 },
  set: { fontSize: 15, color: UiColors.success },
  notSet: { fontSize: 15, color: UiColors.textMuted },
  hint: { fontSize: 14, lineHeight: 20, color: UiColors.textMuted },
});
