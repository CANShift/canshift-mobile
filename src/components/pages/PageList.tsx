import { FlatList, StyleSheet } from "react-native";
import { pageLabel } from "../../lib/page-label";
import { PageRow } from "./PageRow";

export interface PageListProps {
  pageIds: readonly string[];
  onScreenId: string | null;
  selectedId: string | null;
  onSelect: (pageId: string) => void;
}

export const PageList = ({
  pageIds,
  onScreenId,
  selectedId,
  onSelect,
}: PageListProps) => (
  <FlatList
    data={pageIds}
    keyExtractor={(pageId) => pageId}
    style={styles.list}
    contentContainerStyle={styles.content}
    renderItem={({ item, index }) => (
      <PageRow
        index={index}
        label={pageLabel(item)}
        onScreen={item === onScreenId}
        selected={item === selectedId}
        onPress={() => {
          onSelect(item);
        }}
      />
    )}
  />
);

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { gap: 8, paddingBottom: 12 },
});
