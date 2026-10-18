import { ScrollView, StyleSheet, Text } from "react-native";
import { STRINGS } from "../strings";
import { UiColors } from "../theme/ui-tokens";
import { useDeviceScreen } from "../hooks/use-device-screen";
import { useLoggingCard } from "../hooks/use-logging-card";
import { useFirmwareCard } from "../hooks/use-firmware-card";
import { disconnectDash, endDemo } from "../lib/device-actions";
import { retryReconnect } from "../services/session-exit";
import { ConnectionCard } from "../components/device/ConnectionCard";
import { DemoCard } from "../components/device/DemoCard";
import { LoggingCard } from "../components/device/LoggingCard";
import { ConsoleLinkCard } from "../components/device/ConsoleLinkCard";
import { InfoCard } from "../components/device/InfoCard";
import { FirmwareCard } from "../components/device/FirmwareCard";
import { PhoneSettingsCard } from "../components/device/PhoneSettingsCard";
import { DeviceDialogs } from "../components/device/DeviceDialogs";
import { BackRow } from "../components/controls/BackRow";

interface DeviceScreenProps {
  onOpenConsole: () => void;
  onBack?: () => void;
}

const DeviceScreen = ({ onOpenConsole, onBack }: DeviceScreenProps) => {
  const device = useDeviceScreen();
  const logging = useLoggingCard();
  const firmware = useFirmwareCard();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {onBack === undefined ? null : (
        <BackRow label={STRINGS.connect.scanForDashes} onPress={onBack} />
      )}
      <Text style={styles.title} accessibilityRole="header">
        {STRINGS.device.title}
      </Text>
      {device.link === "demo" ? (
        <DemoCard
          onEnd={() => {
            device.setDialog("endDemo");
          }}
        />
      ) : (
        <ConnectionCard
          link={device.link}
          dashName={device.dashName}
          onDisconnect={() => {
            device.setDialog("disconnect");
          }}
          onReconnect={() => void retryReconnect()}
        />
      )}
      <LoggingCard {...logging} />
      <ConsoleLinkCard onPress={onOpenConsole} />
      <InfoCard rows={device.rows} />
      {device.link === "demo" ? null : <FirmwareCard {...firmware} />}
      <PhoneSettingsCard />
      <DeviceDialogs
        dialog={device.dialog}
        onClose={() => {
          device.setDialog("none");
        }}
        onDisconnect={() => void disconnectDash()}
        onEndDemo={endDemo}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: UiColors.bg },
  content: { padding: 16, paddingTop: 12, gap: 10 },
  title: { fontSize: 26, fontWeight: "700", color: UiColors.text },
});

export default DeviceScreen;
