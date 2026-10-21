import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { STRINGS } from "../strings";
import { UiColors } from "../theme/ui-tokens";
import { Segmented } from "../components/controls/Segmented";
import { GpsTimingPane } from "../components/laps/GpsTimingPane";
import { DashTimerPane } from "../components/laps/DashTimerPane";
import { ToolButton } from "../components/buttons/ToolButton";
import { HISTORY_STRINGS } from "../history-strings";

type LapsMode = "gps" | "timer";

const MODE_OPTIONS = [
  { value: "gps", label: STRINGS.laps.gpsTiming },
  { value: "timer", label: STRINGS.laps.dashTimer },
] as const;

interface LapsScreenProps {
  onOpenHistory: () => void;
}

const LapsScreen = ({ onOpenHistory }: LapsScreenProps) => {
  const [mode, setMode] = useState<LapsMode>("gps");
  return (
    <View style={styles.screen}>
      <View style={styles.head}>
        <View style={styles.modes}>
          <Segmented
            options={MODE_OPTIONS}
            value={mode}
            onChange={setMode}
            accessibilityLabel={STRINGS.laps.modeSwitch}
            stretch
          />
        </View>
        <ToolButton label={HISTORY_STRINGS.open} onPress={onOpenHistory} />
      </View>
      {mode === "gps" ? <GpsTimingPane visible /> : <DashTimerPane />}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
    backgroundColor: UiColors.bg,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  modes: { flex: 1 },
});

export default LapsScreen;
