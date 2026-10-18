import { StyleSheet, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import type { LogFilter } from "../../hooks/use-log-filter";
import { ToolButton } from "../buttons/ToolButton";
import { SearchField } from "../controls/SearchField";
import { Glyph } from "../icons/Glyph";

interface LogToolbarProps {
  log: LogFilter;
  onClear: () => void;
}

export const LogToolbar = ({ log, onClear }: LogToolbarProps) => (
  <View style={styles.toolbar}>
    <ToolButton
      label={log.paused ? STRINGS.console.resume : STRINGS.console.pause}
      onPress={log.togglePause}
      icon={
        <Glyph
          name={log.paused ? "play" : "pause"}
          size={16}
          color={UiColors.text}
        />
      }
    />
    <SearchField
      value={log.filter}
      onChange={log.setFilter}
      placeholder={STRINGS.console.filter}
    />
    <ToolButton label={STRINGS.console.clear} onPress={onClear} />
  </View>
);

const styles = StyleSheet.create({
  toolbar: { flexDirection: "row", gap: 8 },
});
