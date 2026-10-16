import { ScrollView, StyleSheet, View } from "react-native";
import { LIVE_PAGES } from "../../lib/live-tiles";
import type { LivePager as Pager } from "../../hooks/use-live-pager";
import { LiveGrid } from "./LiveGrid";

export interface LivePagerProps {
  pager: Pager;
  columns: number;
  paused: boolean;
  nowMs: number;
  valueSize: number;
}

export const LivePager = ({
  pager,
  columns,
  paused,
  nowMs,
  valueSize,
}: LivePagerProps) => (
  <View style={styles.viewport} onLayout={pager.onLayout}>
    <ScrollView
      ref={pager.scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={pager.onSwipeEnd}
    >
      {LIVE_PAGES.map((page, index) => (
        <View key={page.id} style={[styles.page, { width: pager.width }]}>
          {Math.abs(index - pager.page) > 1 ? null : (
            <LiveGrid
              tiles={page.tiles}
              columns={columns}
              paused={paused}
              nowMs={nowMs}
              valueSize={valueSize}
            />
          )}
        </View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  viewport: { flex: 1 },
  page: { flex: 1 },
});
