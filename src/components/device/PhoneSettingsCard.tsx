import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import {
  TELEMETRY_BUFFER_OPTIONS,
  useAppSettingsStore,
} from "../../stores/app-settings.store";
import { SurfaceCard } from "../cards/SurfaceCard";
import { Segmented } from "../controls/Segmented";
import { AutoReconnectSwitch } from "./AutoReconnectSwitch";
import { NotificationsOffRow } from "./NotificationsOffRow";

const SAMPLES_PER_K = 1000;

const BUFFER_OPTIONS = TELEMETRY_BUFFER_OPTIONS.map((value) => ({
  value,
  label: STRINGS.device.samples(value / SAMPLES_PER_K),
}));

export const PhoneSettingsCard = () => {
  const buffer = useAppSettingsStore((s) => s.telemetryBufferSize);
  const setBuffer = useAppSettingsStore((s) => s.setTelemetryBufferSize);
  return (
    <SurfaceCard>
      <Text style={styles.title}>{STRINGS.device.phoneTitle}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{STRINGS.device.graphHistory}</Text>
        <Segmented
          options={BUFFER_OPTIONS}
          value={buffer}
          onChange={setBuffer}
          accessibilityLabel={STRINGS.device.graphHistory}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{STRINGS.device.autoReconnect}</Text>
        <AutoReconnectSwitch />
      </View>
      <NotificationsOffRow />
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 17, fontWeight: "600", color: UiColors.text },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  label: { flex: 1, fontSize: 16, color: UiColors.text },
});
