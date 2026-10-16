import { StyleSheet, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { ActionButton } from "../buttons/ActionButton";
import { Glyph } from "../icons/Glyph";

const ICON = 18;

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
    <ActionButton
      label={userPaused ? STRINGS.graph.resume : STRINGS.graph.pause}
      tone="filled"
      height={TouchTarget.driving}
      onPress={onTogglePause}
      disabled={!hasData}
      icon={(color) => (
        <Glyph name={userPaused ? "play" : "pause"} size={ICON} color={color} />
      )}
    />
    <ActionButton
      label={STRINGS.graph.clear}
      tone="outline"
      height={TouchTarget.driving}
      onPress={onClear}
      disabled={!hasData}
    />
    <ActionButton
      label={STRINGS.graph.export}
      tone="outline"
      height={TouchTarget.driving}
      onPress={onExport}
      disabled={!hasData}
      icon={(color) => (
        <Glyph name="export" size={ICON} color={color} strokeWidth={2} />
      )}
    />
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
});
