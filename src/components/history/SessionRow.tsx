import { Pressable, StyleSheet, Text, View } from "react-native";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";
import type { HistorySession } from "../../lib/session-history";
import {
  SOURCE_TAGS,
  sessionSummary,
  sessionTitle,
} from "../../lib/session-view";
import { Glyph } from "../icons/Glyph";
import { StatusTag } from "../laps/StatusTag";

export interface SessionRowProps {
  session: HistorySession;
  onOpen: (key: string) => void;
}

export const SessionRow = ({ session, onOpen }: SessionRowProps) => {
  const title = sessionTitle(session);
  const tag = SOURCE_TAGS[session.source];
  return (
    <Pressable
      style={styles.row}
      onPress={() => {
        onOpen(session.key);
      }}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.summary}>{sessionSummary(session)}</Text>
      </View>
      <StatusTag label={tag.label} tone={tag.tone} />
      <Glyph name="chevron" size={20} color={UiColors.textMuted} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    minHeight: TouchTarget.driving + 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: UiRadius.card,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  text: { flex: 1, gap: 4 },
  title: { fontSize: 17, fontWeight: "600", color: UiColors.text },
  summary: { fontSize: 15, color: UiColors.textMuted },
});
