import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Info } from "lucide-react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors, Typography, Spacing, Fonts, HitSlop } from "../theme";
import { useDeviceStore } from "../stores/device.store";
import { useReconnectStore } from "../stores/reconnect.store";
import * as BleService from "../services/ble.service";
import * as SimService from "../services/sim.service";
import type { RootStackParamList } from "../navigation";
import {
  BlePermissionDialog,
  type BlePermissionPlatform,
} from "../components/BlePermissionDialog";
import { BrandLockup } from "../components/brand/BrandLockup";
import { DeviceRow } from "../components/scan/DeviceRow";
import { ReconnectStrip } from "../components/scan/ReconnectStrip";
import { ScanStatusNote } from "../components/scan/ScanStatusNote";
import { ScanFooter } from "../components/scan/ScanFooter";
import { useDeviceScan } from "../hooks/use-device-scan";

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Scan">;
}

const ScanScreen = ({ navigation }: Props) => {
  const [unauthorizedPlatform, setUnauthorizedPlatform] =
    useState<BlePermissionPlatform | null>(null);
  const connectionState = useDeviceStore((s) => s.connectionState);
  const isReconnecting = useReconnectStore((s) => s.isReconnecting);
  const reconnectAttempt = useReconnectStore((s) => s.attempt);
  const reconnectMaxAttempts = useReconnectStore((s) => s.maxAttempts);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const handleConnected = useCallback(() => {
    navigation.replace("Connected");
  }, [navigation]);

  const scan = useDeviceScan({
    onUnauthorized: setUnauthorizedPlatform,
    onConnected: handleConnected,
  });

  const startDemo = useCallback(() => {
    SimService.start();
    navigation.replace("Connected");
  }, [navigation]);

  const cancelReconnect = useCallback(() => {
    BleService.cancelReconnect();
  }, []);

  const primaryDisabled = connectionState === "connecting";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.infoBtn}
          onPress={() => {
            navigation.navigate("Device");
          }}
          hitSlop={HitSlop.default}
          accessibilityRole="button"
          accessibilityLabel="Device and app info"
        >
          <Info size={20} color={Colors.textDim} />
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <BrandLockup
          width={windowWidth * 0.72}
          maxHeight={windowHeight * 0.22}
        />
        <Text style={styles.subtitle}>Connect to your dashboard</Text>
      </View>

      <View style={styles.results}>
        {isReconnecting && (
          <ReconnectStrip
            attempt={reconnectAttempt}
            maxAttempts={reconnectMaxAttempts}
            onCancel={cancelReconnect}
          />
        )}

        <ScanStatusNote status={scan.status} />

        {scan.devices.length > 0 && (
          <FlatList
            data={scan.devices}
            keyExtractor={(d) => d.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <DeviceRow
                device={item}
                lastPaired={item.id === scan.lastPairedId}
                connecting={scan.connectingId === item.id}
                disabled={
                  scan.connectingId !== null && scan.connectingId !== item.id
                }
                onPress={(device) => {
                  void scan.connectTo(device);
                }}
              />
            )}
          />
        )}
      </View>

      <ScanFooter
        scanning={scan.scanning}
        hasScanned={scan.hasScanned}
        disabled={primaryDisabled}
        onScanPress={() => {
          if (scan.scanning) {
            scan.stopScan();
            return;
          }
          void scan.startScan();
        }}
        onDemoPress={startDemo}
      />

      <BlePermissionDialog
        platform={unauthorizedPlatform}
        onDismiss={() => {
          setUnauthorizedPlatform(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  infoBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  subtitle: {
    fontFamily: Fonts.ui,
    fontSize: Typography.sm,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  results: {
    flex: 1,
  },
  list: { paddingTop: Spacing.sm },
});

export default ScanScreen;
