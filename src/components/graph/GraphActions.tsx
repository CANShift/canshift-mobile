import { StyleSheet, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { ActionButton } from "../buttons/ActionButton";
import { GraphPauseButton } from "./GraphPauseButton";
import { GraphExportButton } from "./GraphExportButton";

export interface GraphActionsProps {
  hasData: boolean;
  userPaused: boolean;
  onTogglePause: () => void;
  onClear: () => void;
  onExport: () => void;
}

export const GraphActions = ({
  hasData,
  userPaused,
  onTogglePause,
  onClear,
  onExport,
}: GraphActionsProps) => (
  <View style={styles.row}>
    <GraphPauseButton
      hasData={hasData}
      userPaused={userPaused}
      onPress={onTogglePause}
    />
    <ActionButton
      label={STRINGS.graph.clear}
      tone="outline"
      height={TouchTarget.driving}
      onPress={onClear}
      disabled={!hasData}
    />
    <GraphExportButton hasData={hasData} onPress={onExport} />
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
});
