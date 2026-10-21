import { StyleSheet, View } from "react-native";
import { HISTORY_STRINGS } from "../../history-strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { exportLabel, type ExportKind } from "../../services/session-actions";
import { BigButton } from "../buttons/BigButton";

export interface SessionActionsProps {
  exports: readonly ExportKind[];
  onExport: (kind: ExportKind) => void;
  onDelete: () => void;
}

export const SessionActions = ({
  exports,
  onExport,
  onDelete,
}: SessionActionsProps) => (
  <View style={styles.actions}>
    <View style={styles.exports}>
      {exports.map((kind) => (
        <View key={kind} style={styles.export}>
          <BigButton
            label={exportLabel(kind)}
            tone="outline"
            glyph="export"
            height={TouchTarget.driving}
            onPress={() => {
              onExport(kind);
            }}
          />
        </View>
      ))}
    </View>
    <BigButton
      label={HISTORY_STRINGS.deleteSession}
      tone="dangerOutline"
      height={TouchTarget.driving}
      onPress={onDelete}
    />
  </View>
);

const styles = StyleSheet.create({
  actions: { gap: 10 },
  exports: { flexDirection: "row", gap: 10 },
  export: { flex: 1 },
});
