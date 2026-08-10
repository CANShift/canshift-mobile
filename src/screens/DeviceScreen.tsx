import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useShallow } from "zustand/react/shallow";
import { CURRENT_SCHEMA_VERSION } from "@canshift/core";
import { readAppVersion } from "../lib/expo-version";
import { ScreenHeader } from "../components/ScreenHeader";
import { InfoRow } from "../components/InfoRow";
import { SegmentedControl } from "../components/SegmentedControl";
import { Section } from "@/components/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  useAppSettingsStore,
  TELEMETRY_BUFFER_OPTIONS,
  type ReconnectBehavior,
  type TelemetryBufferSize,
} from "../stores/app-settings.store";
import { useDeviceStore, type ConnectionState } from "../stores/device.store";
import * as BleService from "../services/ble.service";
import * as SimService from "../services/sim.service";
import { Colors, Radius, Spacing, Typography, Fonts } from "../theme";
import type { RootStackParamList } from "../navigation";

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Device">;
}

const EM_DASH = "—";
const NOT_CONNECTED = "Not connected";

const CONNECTION_LABEL: Record<ConnectionState, string> = {
  idle: "Disconnected",
  scanning: "Scanning",
  connecting: "Connecting",
  connected: "Connected",
  error: "Error",
};

const RECONNECT_OPTIONS: { label: string; value: ReconnectBehavior }[] = [
  { label: "Automatic", value: "auto" },
  { label: "Off", value: "off" },
];

const BUFFER_OPTIONS: { label: string; value: TelemetryBufferSize }[] =
  TELEMETRY_BUFFER_OPTIONS.map((value) => ({
    label: `${(value / 1000).toString()}k`,
    value,
  }));

export default function DeviceScreen({ navigation }: Props) {
  const { connectionState, firmwareVersion, deviceName, deviceId, isSim } =
    useDeviceStore(
      useShallow((s) => ({
        connectionState: s.connectionState,
        firmwareVersion: s.firmwareVersion,
        deviceName: s.deviceName,
        deviceId: s.deviceId,
        isSim: s.mode === "sim",
      })),
    );
  const telemetryBufferSize = useAppSettingsStore((s) => s.telemetryBufferSize);
  const reconnectBehavior = useAppSettingsStore((s) => s.reconnectBehavior);
  const setTelemetryBufferSize = useAppSettingsStore(
    (s) => s.setTelemetryBufferSize,
  );
  const setReconnectBehavior = useAppSettingsStore(
    (s) => s.setReconnectBehavior,
  );

  const [disconnectVisible, setDisconnectVisible] = useState(false);

  const appVersion = readAppVersion();
  const connected = connectionState === "connected";
  const firmwareValue =
    isSim || !connected
      ? isSim
        ? "Simulator"
        : NOT_CONNECTED
      : firmwareVersion !== null
        ? `v${firmwareVersion}`
        : EM_DASH;

  const confirmDisconnect = useCallback(async () => {
    if (SimService.isRunning()) {
      SimService.stop();
    } else {
      await BleService.disconnect();
    }
    navigation.replace("Scan");
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="DEVICE"
        onBack={() => {
          navigation.goBack();
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dashboard</Text>
          <InfoRow
            label="Connection"
            value={CONNECTION_LABEL[connectionState]}
            muted={!connected}
          />
          <InfoRow
            label="Name"
            value={deviceName ?? NOT_CONNECTED}
            muted={deviceName === null}
          />
          <InfoRow
            label="Firmware"
            value={firmwareValue}
            muted={!connected || firmwareVersion === null}
          />
          <InfoRow
            label="Device ID"
            value={deviceId ?? EM_DASH}
            muted={deviceId === null}
          />
        </View>

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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Application</Text>
          <InfoRow
            label="Mobile app"
            value={appVersion !== null ? `v${appVersion}` : EM_DASH}
            muted={appVersion === null}
          />
          <InfoRow label="Config schema" value={`v${CURRENT_SCHEMA_VERSION}`} />
        </View>

        {(connected || isSim) && (
          <Pressable
            style={styles.disconnectBtn}
            onPress={() => {
              setDisconnectVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={isSim ? "End demo" : "Disconnect"}
          >
            <Text style={styles.disconnectText}>
              {isSim ? "End demo" : "Disconnect"}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <AlertDialog open={disconnectVisible} onOpenChange={setDisconnectVisible}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isSim ? "End demo mode?" : "Disconnect"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isSim
                ? "Stop the simulator and return to scan?"
                : "Disconnect from the dashboard?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onPress={() => void confirmDisconnect()}>
              {isSim ? "End demo" : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.lg, gap: Spacing.xl },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardTitle: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    color: Colors.textDim,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  disconnectBtn: {
    minHeight: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
    alignItems: "center",
    justifyContent: "center",
  },
  disconnectText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.md,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: Colors.accent,
  },
});
