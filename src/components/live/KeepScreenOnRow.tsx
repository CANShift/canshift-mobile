import { StyleSheet, Switch, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { useAppSettingsStore } from "../../stores/app-settings.store";

export const KeepScreenOnRow = () => {
  const keepScreenOn = useAppSettingsStore((s) => s.keepScreenOn);
  const setKeepScreenOn = useAppSettingsStore((s) => s.setKeepScreenOn);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{STRINGS.live.keepScreenOn}</Text>
      <Switch
        value={keepScreenOn}
        onValueChange={setKeepScreenOn}
        trackColor={{ true: UiColors.success, false: UiColors.surface2 }}
        accessibilityLabel={STRINGS.live.keepScreenOn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: { fontSize: 16, color: UiColors.text },
});
