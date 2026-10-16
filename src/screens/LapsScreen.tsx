import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { STRINGS } from "../strings";
import { UiColors } from "../theme/ui-tokens";
import { Segmented } from "../components/controls/Segmented";
import { GpsTimingPane } from "../components/laps/GpsTimingPane";
import { DashTimerPane } from "../components/laps/DashTimerPane";

type LapsMode = "gps" | "timer";

const MODE_OPTIONS = [
  { value: "gps", label: STRINGS.laps.gpsTiming },
  { value: "timer", label: STRINGS.laps.dashTimer },
] as const;

const LapsScreen = () => {
  const [mode, setMode] = useState<LapsMode>("gps");
  return (
    <View style={styles.screen}>
      <Segmented
        options={MODE_OPTIONS}
        value={mode}
        onChange={setMode}
        accessibilityLabel={STRINGS.laps.modeSwitch}
        stretch
      />
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
});

export default LapsScreen;
