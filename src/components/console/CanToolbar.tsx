import { StyleSheet, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import type { CanMonitorView } from "../../hooks/use-can-monitor-view";
import { ToolButton } from "../buttons/ToolButton";
import { SearchField } from "../controls/SearchField";
import { Glyph } from "../icons/Glyph";

interface CanToolbarProps {
  view: CanMonitorView;
}

export const CanToolbar = ({ view }: CanToolbarProps) => (
  <View style={styles.toolbar}>
    <ToolButton
      label={view.paused ? STRINGS.console.resume : STRINGS.console.pause}
      onPress={view.togglePause}
      icon={
        <Glyph
          name={view.paused ? "play" : "pause"}
          size={16}
          color={UiColors.text}
        />
      }
    />
    <SearchField
      value={view.filter}
      onChange={view.setFilter}
      placeholder={STRINGS.console.canFilter}
    />
  </View>
);

const styles = StyleSheet.create({
  toolbar: { flexDirection: "row", gap: 8 },
});
