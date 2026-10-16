import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiFonts, UiRadius } from "../../theme/ui-tokens";
import type { SentCommand } from "../../hooks/use-send-console";

export interface SentCommandCardProps {
  sent: SentCommand;
}

const formatTime = (ms: number): string =>
  new Date(ms).toLocaleTimeString("en-GB", { hour12: false });

export const SentCommandCard = ({ sent }: SentCommandCardProps) => (
  <View style={styles.card} accessible>
    <Text style={styles.meta}>
      {STRINGS.console.sentAt(formatTime(sent.atMs))}
    </Text>
    <Text style={styles.command}>{`> ${sent.command}`}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 12,
    gap: 6,
    borderRadius: UiRadius.tile,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
  },
  meta: { fontSize: 12, color: UiColors.textMuted },
  command: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: UiFonts.numeric,
    color: UiColors.text,
  },
});
