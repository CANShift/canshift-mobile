import { FlatList, StyleSheet } from "react-native";
import type { DeviceScan } from "../../hooks/use-device-scan";
import { DashCard } from "./DashCard";

interface FoundDashListProps {
  scan: DeviceScan;
  header: React.JSX.Element;
}

export const FoundDashList = ({ scan, header }: FoundDashListProps) => (
  <FlatList
    style={styles.list}
    contentContainerStyle={styles.listContent}
    ListHeaderComponent={header}
    data={scan.devices}
    keyExtractor={(dash) => dash.id}
    renderItem={({ item }) => (
      <DashCard
        dash={item}
        lastUsed={item.id === scan.lastPairedId}
        onPress={(dash) => void scan.connectTo(dash)}
      />
    )}
  />
);

const styles = StyleSheet.create({
  list: { flexGrow: 0, flexShrink: 1 },
  listContent: { gap: 10 },
});
