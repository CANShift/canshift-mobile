import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors, Spacing } from "../theme";
import { useDeviceStore } from "../stores/device.store";
import { PORTRAIT_GRID_COLUMNS } from "../constants/dash-layout";
import { ShiftStrip } from "../components/widgets";
import { DashPortraitLayout } from "../components/dash/DashPortraitLayout";
import { DashLandscapeLayout } from "../components/dash/DashLandscapeLayout";
import DashTopBar from "../components/DashTopBar";
import type { RootStackParamList } from "../navigation";

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Connected">;
}

const DashScreen = (_: Props) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const dayMode = useDeviceStore((s) => s.isDayMode) === true;

  const portraitCellWidth = Math.floor(
    (width - Spacing.lg * 2 - Spacing.sm * (PORTRAIT_GRID_COLUMNS - 1)) /
      PORTRAIT_GRID_COLUMNS,
  );

  return (
    <SafeAreaView style={styles.container}>
      <DashTopBar />

      <View style={styles.shiftStripWrap}>
        <ShiftStrip />
      </View>

      {isLandscape ? (
        <DashLandscapeLayout dayMode={dayMode} />
      ) : (
        <DashPortraitLayout dayMode={dayMode} cellWidth={portraitCellWidth} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  shiftStripWrap: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
});

export default DashScreen;
