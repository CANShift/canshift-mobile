import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SegmentedControl } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { LogTab } from "../components/console/LogTab";
import { SendTab } from "../components/console/SendTab";
import { CanTab } from "../components/console/CanTab";
import { Colors } from "../theme";

type ConsoleTab = "can" | "log" | "send";

const TABS: { value: ConsoleTab; label: string }[] = [
  { value: "can", label: "CAN" },
  { value: "log", label: "Log" },
  { value: "send", label: "Send" },
];

const TAB_VIEWS: Record<ConsoleTab, () => React.ReactElement> = {
  can: CanTab,
  log: LogTab,
  send: SendTab,
};

interface LogScreenProps {
  onBack: () => void;
}

const LogScreen = ({ onBack }: LogScreenProps) => {
  const [tab, setTab] = useState<ConsoleTab>("log");
  const TabView = TAB_VIEWS[tab];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Console" onBack={onBack} />
      <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      <TabView />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
});

export default LogScreen;
