import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors, Spacing } from "../theme";
import { ScreenHeader } from "../components/ScreenHeader";
import { SegmentedControl } from "../components/SegmentedControl";
import { Section } from "@/components/ui";
import {
  useAppSettingsStore,
  TELEMETRY_BUFFER_OPTIONS,
  type ReconnectBehavior,
  type TelemetryBufferSize,
} from "../stores/app-settings.store";
import type { RootStackParamList } from "../navigation";

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Settings">;
}

const RECONNECT_OPTIONS: { label: string; value: ReconnectBehavior }[] = [
  { label: "Automatic", value: "auto" },
  { label: "Off", value: "off" },
];

const BUFFER_OPTIONS: { label: string; value: TelemetryBufferSize }[] =
  TELEMETRY_BUFFER_OPTIONS.map((value) => ({
    label: `${(value / 1000).toString()}k samples`,
    value,
  }));

export default function SettingsScreen({ navigation }: Props) {
  const telemetryBufferSize = useAppSettingsStore((s) => s.telemetryBufferSize);
  const reconnectBehavior = useAppSettingsStore((s) => s.reconnectBehavior);
  const setTelemetryBufferSize = useAppSettingsStore(
    (s) => s.setTelemetryBufferSize,
  );
  const setReconnectBehavior = useAppSettingsStore(
    (s) => s.setReconnectBehavior,
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="SETTINGS"
        onBack={() => {
          navigation.goBack();
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Section title="TELEMETRY BUFFER">
          <SegmentedControl
            options={BUFFER_OPTIONS}
            value={telemetryBufferSize}
            onChange={setTelemetryBufferSize}
          />
        </Section>

        <Section title="RECONNECT">
          <SegmentedControl
            options={RECONNECT_OPTIONS}
            value={reconnectBehavior}
            onChange={setReconnectBehavior}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.lg, gap: Spacing.xl },
});
