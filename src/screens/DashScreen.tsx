import React, { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors } from "../theme";
import { useDeviceStore } from "../stores/device.store";
import {
  DASH_PAGE_OPTIONS,
  DEFAULT_DASH_PAGE_ID,
  dashPageById,
  type DashPageId,
} from "../lib/dash-pages";
import { dashPalette } from "../lib/dash-palette";
import { SegmentedControl } from "../components/ui";
import { DashPanel } from "../components/dash/DashPanel";
import { DashLinkFooter } from "../components/dash/DashLinkFooter";
import DashTopBar from "../components/DashTopBar";
import type { RootStackParamList } from "../navigation";

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Connected">;
}

const DashScreen = (_: Props) => {
  const [pageId, setPageId] = useState<DashPageId>(DEFAULT_DASH_PAGE_ID);
  const dayMode = useDeviceStore((s) => s.isDayMode) === true;
  const palette = useMemo(() => dashPalette(dayMode), [dayMode]);

  return (
    <SafeAreaView style={styles.container}>
      <DashTopBar title="Dashboard" />
      <SegmentedControl
        options={DASH_PAGE_OPTIONS}
        value={pageId}
        onChange={setPageId}
      />
      <DashPanel page={dashPageById(pageId)} palette={palette} />
      <DashLinkFooter />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
});

export default DashScreen;
