import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  Info,
  Play,
  Search,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Square,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_ACCENT } from "@canshift/core";
import { Colors, Typography, Spacing, Radius, Fonts, HitSlop } from "../theme";
import { useDeviceStore } from "../stores/device.store";
import { useReconnectStore } from "../stores/reconnect.store";
import * as BleService from "../services/ble.service";
import type { BlePermissionState } from "../services/ble.service";
import { getLastDevice } from "../services/last-device";
import { mapBleError } from "../services/ble.errors";
import { bleErrorMessage } from "../services/ble-error-message";
import * as SimService from "../services/sim.service";
import type { RootStackParamList } from "../navigation";
import {
  BlePermissionDialog,
  type BlePermissionPlatform,
} from "../components/ble-permission-dialog";
import { Card } from "../components/ui";
import { BrandLockup } from "../components/brand/BrandLockup";

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Scan">;
}

interface FoundDevice {
  id: string;
  name: string;
  rssi: number | null;
}

const ACCENT_BAR_HEIGHT = 64;
const SECONDARY_ROW_HEIGHT = 56;
const RSSI_STRONG = -60;
const RSSI_FAIR = -75;

interface SignalStrength {
  Icon: LucideIcon;
  color: string;
}

const signalStrength = (rssi: number | null): SignalStrength => {
  if (rssi === null) return { Icon: Signal, color: Colors.textMuted };
  if (rssi >= RSSI_STRONG) return { Icon: SignalHigh, color: Colors.accent };
  if (rssi >= RSSI_FAIR) return { Icon: SignalMedium, color: Colors.textDim };
  return { Icon: SignalLow, color: Colors.textMuted };
};

interface DeviceRowProps {
  device: FoundDevice;
  lastPaired: boolean;
  connecting: boolean;
  disabled: boolean;
  onPress: (device: FoundDevice) => void;
}

const DeviceRow = React.memo(
  ({ device, lastPaired, connecting, disabled, onPress }: DeviceRowProps) => {
    const strength = signalStrength(device.rssi);
    return (
      <TouchableOpacity
        onPress={() => {
          onPress(device);
        }}
        disabled={connecting || disabled}
        accessibilityRole="button"
        accessibilityLabel={`Connect to ${device.name}`}
        accessibilityState={{ disabled: connecting || disabled }}
      >
        <Card className="flex-row items-center gap-3">
          <strength.Icon size={22} color={strength.color} />
          <View style={styles.deviceInfo}>
            <View style={styles.deviceNameRow}>
              <Text style={styles.deviceName} numberOfLines={1}>
                {device.name}
              </Text>
              {lastPaired && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>LAST PAIRED</Text>
                </View>
              )}
            </View>
            <Text style={styles.deviceMeta} numberOfLines={1}>
              {device.rssi === null
                ? device.id
                : `${String(device.rssi)} dBm · ${device.id}`}
            </Text>
          </View>
          {connecting ? (
            <ActivityIndicator color={Colors.accent} size="small" />
          ) : (
            <ChevronRight size={18} color={Colors.textMuted} />
          )}
        </Card>
      </TouchableOpacity>
    );
  },
);
DeviceRow.displayName = "DeviceRow";

export default function ScanScreen({ navigation }: Props) {
  const [scanning, setScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [devices, setDevices] = useState<FoundDevice[]>([]);
  const [lastPairedId, setLastPairedId] = useState<string | null>(null);
  const [unauthorizedPlatform, setUnauthorizedPlatform] =
    useState<BlePermissionPlatform | null>(null);
  const connectionState = useDeviceStore((s) => s.connectionState);
  const isReconnecting = useReconnectStore((s) => s.isReconnecting);
  const reconnectAttempt = useReconnectStore((s) => s.attempt);
  const reconnectMaxAttempts = useReconnectStore((s) => s.maxAttempts);

  useEffect(() => {
    void getLastDevice().then(setLastPairedId);
  }, []);

  const promptUnauthorized = useCallback(
    (platform: BlePermissionPlatform): void => {
      setUnauthorizedPlatform(platform);
    },
    [],
  );

  const promptForBleState = useCallback(
    (state: Exclude<BlePermissionState, { kind: "ok" }>): void => {
      switch (state.kind) {
        case "powered_off":
          Alert.alert(
            "Bluetooth is off",
            "Turn Bluetooth on to scan for your dashboard.",
          );
          return;
        case "unauthorized":
          promptUnauthorized(state.platform);
          return;
        case "unsupported":
          Alert.alert(
            "Bluetooth unavailable",
            "This device doesn't support Bluetooth Low Energy.",
          );
          return;
        case "resetting":
          Alert.alert(
            "Bluetooth restarting",
            "Bluetooth is resetting. Try again in a moment.",
          );
          return;
        case "unknown":
          Alert.alert(
            "Checking Bluetooth",
            "Bluetooth state is not yet available. Try again in a moment.",
          );
          return;
        default: {
          const _exhaustive: never = state;
          void _exhaustive;
          return;
        }
      }
    },
    [promptUnauthorized],
  );

  const startScan = useCallback(async () => {
    const state = await BleService.getBlePermissionState();
    if (state.kind !== "ok") {
      promptForBleState(state);
      return;
    }
    setDevices([]);
    setScanning(true);
    try {
      await BleService.scan((device) => {
        setDevices((prev) =>
          prev.find((d) => d.id === device.id) ? prev : [...prev, device],
        );
      }, 10000);
      setHasScanned(true);
    } catch (err) {
      const mapped = mapBleError(err);
      if (mapped.kind === "permission-denied") {
        promptUnauthorized(mapped.platform);
      } else {
        const { title, body } = bleErrorMessage(mapped);
        Alert.alert(title, body);
      }
    } finally {
      setScanning(false);
    }
  }, [promptForBleState, promptUnauthorized]);

  const stopScan = useCallback(() => {
    BleService.stopScan();
  }, []);

  const cancelReconnect = useCallback(() => {
    BleService.cancelReconnect();
  }, []);

  const connectTo = useCallback(
    async (device: FoundDevice) => {
      BleService.stopScan();
      setConnectingId(device.id);
      try {
        await BleService.connect(device.id);
        navigation.replace("Connected");
      } catch (err) {
        const mapped = mapBleError(err);
        if (mapped.kind === "permission-denied") {
          promptUnauthorized(mapped.platform);
          return;
        }
        const { title, body } = bleErrorMessage(mapped);
        Alert.alert(title, body);
      } finally {
        setConnectingId(null);
      }
    },
    [navigation, promptUnauthorized],
  );

  const startDemo = useCallback(() => {
    SimService.start();
    navigation.replace("Connected");
  }, [navigation]);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const primaryDisabled = connectionState === "connecting";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.infoBtn}
          onPress={() => {
            navigation.navigate("About");
          }}
          hitSlop={HitSlop.default}
          accessibilityRole="button"
          accessibilityLabel="About"
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
          <Card
            variant="accent"
            padding="none"
            className="w-full flex-row items-center gap-2 mb-3 px-3 py-2"
          >
            <ActivityIndicator color={Colors.accent} size="small" />
            <Text style={styles.reconnectText}>
              {`Reconnecting to dashboard… (${String(reconnectAttempt)}/${String(reconnectMaxAttempts)})`}
            </Text>
            <TouchableOpacity
              onPress={cancelReconnect}
              hitSlop={HitSlop.default}
              accessibilityRole="button"
              accessibilityLabel="Cancel reconnecting"
            >
              <Text style={styles.reconnectCancel}>Cancel</Text>
            </TouchableOpacity>
          </Card>
        )}

        {scanning && (
          <Text style={styles.scanHint}>Searching for CANShift devices…</Text>
        )}

        {!scanning && hasScanned && devices.length === 0 && (
          <View
            style={styles.emptyState}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.emptyTitle}>No dashboards found</Text>
            <Text style={styles.emptyHint}>
              Make sure your dashboard is powered on and in range, then scan
              again.
            </Text>
          </View>
        )}

        {devices.length > 0 && (
          <FlatList
            data={devices}
            keyExtractor={(d) => d.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <DeviceRow
                device={item}
                lastPaired={item.id === lastPairedId}
                connecting={connectingId === item.id}
                disabled={connectingId !== null && connectingId !== item.id}
                onPress={connectTo}
              />
            )}
          />
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.scanBar, primaryDisabled && styles.scanBarDisabled]}
          onPress={scanning ? stopScan : startScan}
          disabled={primaryDisabled}
          accessibilityRole="button"
          accessibilityLabel={
            scanning
              ? "Stop scanning"
              : hasScanned
                ? "Scan again"
                : "Scan for devices"
          }
          accessibilityState={{ disabled: primaryDisabled }}
        >
          <Text style={styles.scanBarLabel}>
            {scanning
              ? "Stop scanning"
              : hasScanned
                ? "Scan again"
                : "Scan for devices"}
          </Text>
          {scanning ? (
            <Square size={18} color={Colors.bg} fill={Colors.bg} />
          ) : (
            <Search size={20} color={Colors.bg} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.demoRow}
          onPress={startDemo}
          accessibilityRole="button"
          accessibilityLabel="Demo simulation"
        >
          <Play size={16} color={Colors.textDim} />
          <Text style={styles.demoLabel}>Demo — simulation</Text>
        </TouchableOpacity>
      </View>

      <BlePermissionDialog
        platform={unauthorizedPlatform}
        onDismiss={() => {
          setUnauthorizedPlatform(null);
        }}
      />
    </SafeAreaView>
  );
}

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
  reconnectText: {
    fontFamily: Fonts.ui,
    fontSize: Typography.sm,
    color: Colors.text,
    flex: 1,
  },
  reconnectCancel: {
    fontFamily: Fonts.uiSemiBold,
    fontSize: Typography.sm,
    color: Colors.accent,
  },
  scanHint: {
    fontFamily: Fonts.ui,
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  emptyTitle: {
    fontFamily: Fonts.uiSemiBold,
    fontSize: Typography.md,
    color: Colors.text,
  },
  emptyHint: {
    fontFamily: Fonts.ui,
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: "center",
  },
  list: { gap: Spacing.sm, paddingTop: Spacing.sm },
  deviceInfo: { flex: 1 },
  deviceNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  deviceName: {
    fontFamily: Fonts.uiSemiBold,
    fontSize: Typography.md,
    color: Colors.text,
    flexShrink: 1,
  },
  deviceMeta: {
    fontFamily: Fonts.ui,
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  badge: {
    borderRadius: Radius.sm,
    backgroundColor: Colors.accentDim,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    color: Colors.accent,
    letterSpacing: 1,
  },
  footer: {
    paddingBottom: Spacing.sm,
  },
  scanBar: {
    height: ACCENT_BAR_HEIGHT,
    backgroundColor: BRAND_ACCENT,
    borderRadius: Radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
  },
  scanBarDisabled: { opacity: 0.5 },
  scanBarLabel: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.md,
    color: Colors.bg,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  demoRow: {
    height: SECONDARY_ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  demoLabel: {
    fontFamily: Fonts.uiSemiBold,
    fontSize: Typography.sm,
    color: Colors.textDim,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
