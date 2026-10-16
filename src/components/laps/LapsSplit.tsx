import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useIsLandscape } from "../../hooks/use-is-landscape";

export interface LapsSplitProps {
  top: ReactNode;
  bottom: ReactNode;
}

export const LapsSplit = ({ top, bottom }: LapsSplitProps) => {
  const landscape = useIsLandscape();
  return (
    <View style={landscape ? styles.row : styles.column}>
      <View style={landscape ? styles.pane : styles.top}>{top}</View>
      <View style={styles.pane}>{bottom}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  column: { flex: 1, gap: 12 },
  row: { flex: 1, flexDirection: "row", gap: 16 },
  top: { gap: 12 },
  pane: { flex: 1, gap: 12 },
});
