import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import { CURRENT_SCHEMA_VERSION } from "@canshift/core";
import { readAppVersion } from "../lib/expo-version";
import { firmwareLabel } from "../lib/device-labels";
import { ScreenHeader } from "../components/ScreenHeader";
import { InfoRow } from "../components/InfoRow";
import { NavRow } from "../components/NavRow";
import { LowBatteryWarning } from "../components/device/LowBatteryWarning";
import {
  Button,
  Section,
  SectionLabel,
  SegmentedControl,
  Toast,
} from "@/components/ui";
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
import { usePhoneBatteryStore } from "../stores/phone-battery.store";
import { useTrackSessionStore } from "../stores/track-session.store";
import { useSignalValue } from "../stores/signals.store";
import { useLoggingElapsedMs } from "../hooks/use-logging-elapsed-ms";
import { isPhoneBatteryLow } from "../lib/phone-battery";
import { loggingStatusText } from "../lib/logging-status";
import { errText } from "../lib/error-text";
import { formatWidgetValue } from "../components/widgets/widget-value";
import { SIGNAL_META } from "../constants/ble";
import * as BleService from "../services/ble.service";
import * as SimService from "../services/sim.service";
import { trackModeController } from "../services/track-mode-controller";
import { Colors, Spacing, SCREEN_PADDING } from "../theme";

interface DeviceNav {
  goBack: () => void;
  replace: (screen: "Scan") => void;
  navigate: (screen: "Console") => void;
}

interface Props {
  navigation: DeviceNav;
  showBack?: boolean;
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

const STOP_LOGGING_LABEL = "STOP LOGGING NOW";

const dashBatteryText = (volts: number | undefined): string =>
  volts === undefined
    ? EM_DASH
    : `${formatWidgetValue(volts, SIGNAL_META.bat.decimals)} ${SIGNAL_META.bat.unit}`;

const DeviceScreen = ({ navigation, showBack = false }: Props) => {
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

  const batteryLow = usePhoneBatteryStore((s) =>
    isPhoneBatteryLow(s.levelPercent),
  );
  const recording = useTrackSessionStore((s) => s.recording);
  const loggingElapsedMs = useLoggingElapsedMs();
  const dashVolts = useSignalValue("bat");

  const appVersion = readAppVersion();
  const connected = connectionState === "connected";
  const firmwareValue = firmwareLabel(isSim, connected, firmwareVersion);

  const stopLogging = useCallback(async () => {
    try {
      await trackModeController.stop();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Could not stop logging",
        text2: errText(err),
      });
    }
  }, []);

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
        title="Device"
        onBack={
          showBack
            ? () => {
                navigation.goBack();
              }
            : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {batteryLow && <LowBatteryWarning />}

        <View style={styles.section}>
          <InfoRow
            label="LOGGING"
            value={loggingStatusText(recording, loggingElapsedMs)}
            muted={!recording}
          />
          <InfoRow
            label="DASH BATT"
            value={dashBatteryText(dashVolts)}
            muted={dashVolts === undefined}
          />
        </View>

        <View style={styles.section}>
          <SectionLabel>Dashboard</SectionLabel>
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

        <Section title="TELEMETRY BUFFER" style={styles.section}>
          <SegmentedControl
            options={BUFFER_OPTIONS}
            value={telemetryBufferSize}
            onChange={setTelemetryBufferSize}
          />
        </Section>

        <Section title="RECONNECT" style={styles.section}>
          <SegmentedControl
            options={RECONNECT_OPTIONS}
            value={reconnectBehavior}
            onChange={setReconnectBehavior}
          />
        </Section>

        <View style={styles.section}>
          <SectionLabel>Application</SectionLabel>
          <InfoRow
            label="Mobile app"
            value={appVersion !== null ? `v${appVersion}` : EM_DASH}
            muted={appVersion === null}
          />
          <InfoRow label="Config schema" value={`v${CURRENT_SCHEMA_VERSION}`} />
        </View>

        <NavRow
          label="Console"
          onPress={() => {
            navigation.navigate("Console");
          }}
        />

        {(connected || isSim) && (
          <View style={styles.disconnectWrap}>
            <Button
              variant="destructive"
              onPress={() => {
                setDisconnectVisible(true);
              }}
              accessibilityLabel={isSim ? "End demo" : "Disconnect"}
            >
              {isSim ? "End demo" : "Disconnect"}
            </Button>
          </View>
        )}
      </ScrollView>

      {batteryLow && recording && (
        <View style={styles.stopLoggingWrap}>
          <Button
            variant="destructive"
            onPress={() => {
              void stopLogging();
            }}
            accessibilityLabel={STOP_LOGGING_LABEL}
          >
            {STOP_LOGGING_LABEL}
          </Button>
        </View>
      )}

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
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1 },
  section: {
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 18,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ruleHair,
  },
  disconnectWrap: {
    marginTop: "auto",
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: Spacing.lg,
  },
  stopLoggingWrap: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: Spacing.lg,
  },
});

export default DeviceScreen;
