import React, { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors, Typography, Spacing, HitSlop, Fonts } from "../theme";
import { useDeviceStore } from "../stores/device.store";
import { useReconnectStore } from "../stores/reconnect.store";
import * as BleService from "../services/ble.service";
import type { RootStackParamList } from "../navigation";

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Connected">;
}

const BANNER_RULE = 2;
const BANNER_TEXT_SIZE = 11;
const BANNER_TEXT_TRACKING = BANNER_TEXT_SIZE * 0.14;

const ReconnectBanner = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const isSim = useDeviceStore((s) => s.mode === "sim");
  const { isReconnecting, attempt, maxAttempts } = useReconnectStore(
    useShallow((s) => ({
      isReconnecting: s.isReconnecting,
      attempt: s.attempt,
      maxAttempts: s.maxAttempts,
    })),
  );

  const cancelAndGoToScan = useCallback(() => {
    BleService.cancelReconnect();
    useDeviceStore.getState().clearError();
    navigation.replace("Scan");
  }, [navigation]);

  if (isSim || !isReconnecting) return null;

  return (
    <View
      style={[styles.banner, { paddingTop: insets.top + Spacing.sm }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text}>
        {`RECONNECTING · ATTEMPT ${String(attempt)}/${String(maxAttempts)}`}
      </Text>
      <TouchableOpacity
        onPress={cancelAndGoToScan}
        hitSlop={HitSlop.default}
        accessibilityRole="button"
        accessibilityLabel="Cancel reconnecting and return to scan"
      >
        <Text style={styles.cancel}>CANCEL</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.bg,
    borderBottomWidth: BANNER_RULE,
    borderBottomColor: Colors.border,
  },
  text: {
    flex: 1,
    fontFamily: Fonts.mono,
    fontSize: BANNER_TEXT_SIZE,
    letterSpacing: BANNER_TEXT_TRACKING,
    color: Colors.warning,
  },
  cancel: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    letterSpacing: Typography.xs * 0.09,
    color: Colors.accent,
  },
});

export default ReconnectBanner;
