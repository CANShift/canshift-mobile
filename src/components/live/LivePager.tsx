import { ScrollView, StyleSheet, View } from "react-native";
import { LIVE_PAGES } from "../../lib/live-tiles";
import type { LivePager as Pager } from "../../hooks/use-live-pager";
import { LivePagerPage } from "./LivePagerPage";

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
        <LivePagerPage
          key={page.id}
          width={pager.width}
          near={Math.abs(index - pager.page) <= 1}
          tiles={page.tiles}
          columns={columns}
          paused={paused}
          nowMs={nowMs}
          valueSize={valueSize}
        />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  viewport: { flex: 1 },
});
