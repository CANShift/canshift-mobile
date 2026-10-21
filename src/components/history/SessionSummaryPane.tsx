import { StyleSheet, Text, View } from "react-native";
import { UiColors } from "../../theme/ui-tokens";
import type { SessionDetailModel } from "../../hooks/use-session-detail";
import { SOURCE_TAGS, sessionMeta } from "../../lib/session-view";
import { StatusTag } from "../laps/StatusTag";
import { CantSaveNote } from "../laps/CantSaveNote";
import { SessionLabelField } from "./SessionLabelField";
import { StatGrid } from "./StatGrid";

export interface SessionSummaryPaneProps {
  detail: SessionDetailModel;
}

export const SessionSummaryPane = ({ detail }: SessionSummaryPaneProps) => {
  const { session } = detail;
  const tag = SOURCE_TAGS[session.source];
  return (
    <>
      {detail.storageNote === null ? null : (
        <CantSaveNote
          message={detail.storageNote}
          onDismiss={detail.dismissStorageNote}
        />
      )}
      <SessionLabelField
        key={session.key}
        label={session.label}
        onRename={detail.rename}
      />
      <View style={styles.meta}>
        <StatusTag label={tag.label} tone={tag.tone} />
        <Text style={styles.date}>{sessionMeta(session)}</Text>
      </View>
      <StatGrid tiles={detail.tiles} />
    </>
  );
};

const styles = StyleSheet.create({
  meta: { flexDirection: "row", alignItems: "center", gap: 10 },
  date: { fontSize: 15, color: UiColors.textMuted },
});
