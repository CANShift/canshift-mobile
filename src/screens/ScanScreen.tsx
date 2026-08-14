import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors, SCREEN_PADDING } from "../theme";
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
import { ScreenHeader } from "../components/ScreenHeader";
import { DeviceRow } from "../components/scan/DeviceRow";
import { ReconnectStrip } from "../components/scan/ReconnectStrip";
import { ScanStatusNote } from "../components/scan/ScanStatusNote";
import { ScanFooter } from "../components/scan/ScanFooter";
import { useDeviceScan } from "../hooks/use-device-scan";

const BRAND_WIDTH = 132;
const BRAND_PADDING_TOP = 12;

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

  const openDeviceInfo = useCallback(() => {
    navigation.navigate("Device");
  }, [navigation]);

  const cancelReconnect = useCallback(() => {
    BleService.cancelReconnect();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brand}>
        <BrandLockup width={BRAND_WIDTH} />
      </View>

      <ScreenHeader title="Pairing" />

      <View style={styles.body}>
        {isReconnecting && (
          <ReconnectStrip
            attempt={reconnectAttempt}
            maxAttempts={reconnectMaxAttempts}
            onCancel={cancelReconnect}
          />
        )}

        <ScanStatusNote status={scan.status} />

        <FlatList
          data={scan.devices}
          keyExtractor={(device) => device.id}
          renderItem={({ item }) => (
            <DeviceRow
              device={item}
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
      </View>

      <ScanFooter
        scanning={scan.scanning}
        hasScanned={scan.hasScanned}
        disabled={connectionState === "connecting"}
        onScanPress={() => {
          if (scan.scanning) {
            scan.stopScan();
            return;
          }
          void scan.startScan();
        }}
        onDemoPress={startDemo}
        onInfoPress={openDeviceInfo}
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
  },
  brand: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: BRAND_PADDING_TOP,
  },
  body: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING,
  },
});

export default ScanScreen;
