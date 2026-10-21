import { FlatList, StyleSheet } from "react-native";
import { HISTORY_STRINGS } from "../../history-strings";
import { UiColors } from "../../theme/ui-tokens";
import type { HistorySession } from "../../lib/session-history";
import { EmptyCard } from "../cards/EmptyCard";
import { Glyph } from "../icons/Glyph";
import { SessionRow } from "./SessionRow";

export interface SessionListProps {
  sessions: readonly HistorySession[];
  onOpen: (key: string) => void;
}

export const SessionList = ({ sessions, onOpen }: SessionListProps) => {
  if (sessions.length === 0)
    return (
      <EmptyCard
        icon={<Glyph name="target" size={36} color={UiColors.textMuted} />}
        title={HISTORY_STRINGS.emptyTitle}
        body={HISTORY_STRINGS.emptyBody}
      />
    );
  return (
    <FlatList
      data={sessions}
      keyExtractor={(session) => session.key}
      renderItem={({ item }) => <SessionRow session={item} onOpen={onOpen} />}
      contentContainerStyle={styles.content}
    />
  );
};

const styles = StyleSheet.create({
  content: { gap: 10, paddingBottom: 12 },
});
