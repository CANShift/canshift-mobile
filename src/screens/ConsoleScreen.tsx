import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../strings";
import { UiColors } from "../theme/ui-tokens";
import { Segmented } from "../components/controls/Segmented";
import { BackRow } from "../components/controls/BackRow";
import { LogTab } from "../components/console/LogTab";
import { SendTab } from "../components/console/SendTab";
import { CanTab } from "../components/console/CanTab";

type ConsoleTab = "log" | "send" | "can";

const TABS = [
  { value: "log", label: STRINGS.console.log },
  { value: "send", label: STRINGS.console.send },
  { value: "can", label: STRINGS.console.can },
] as const;

const TAB_VIEWS: Record<ConsoleTab, () => React.JSX.Element> = {
  log: LogTab,
  send: SendTab,
  can: CanTab,
};

interface ConsoleScreenProps {
  onBack: () => void;
}

const ConsoleScreen = ({ onBack }: ConsoleScreenProps) => {
  const [tab, setTab] = useState<ConsoleTab>("log");
  const TabView = TAB_VIEWS[tab];
  return (
    <View style={styles.screen}>
      <View style={styles.head}>
        <BackRow label={STRINGS.console.back} onPress={onBack} />
        <Text style={styles.title} accessibilityRole="header">
          {STRINGS.console.title}
        </Text>
      </View>
      <Segmented
        options={TABS}
        value={tab}
        onChange={setTab}
        accessibilityLabel={STRINGS.console.title}
        stretch
      />
      <TabView />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 4,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
    backgroundColor: UiColors.bg,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "700", color: UiColors.text },
});

export default ConsoleScreen;
