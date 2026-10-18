import { StyleSheet, View } from "react-native";
import { LiveGrid, type LiveGridProps } from "./LiveGrid";

interface LivePagerPageProps extends LiveGridProps {
  width: number;
  near: boolean;
}

export const LivePagerPage = ({ width, near, ...grid }: LivePagerPageProps) => (
  <View style={[styles.page, { width }]}>
    {near ? <LiveGrid {...grid} /> : null}
  </View>
);

const styles = StyleSheet.create({
  page: { flex: 1 },
});
