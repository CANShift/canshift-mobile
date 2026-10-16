import { StyleSheet, View } from "react-native";
import { UiColors } from "../theme/ui-tokens";
import { useLiveScreen } from "../hooks/use-live-screen";
import ShiftLight from "../components/live/ShiftLight";
import { LivePager } from "../components/live/LivePager";
import { PageChips } from "../components/live/PageChips";
import { useLivePager } from "../hooks/use-live-pager";
import { LinkFooter } from "../components/live/LinkFooter";
import { DisplaySheet } from "../components/live/DisplaySheet";

const LiveScreen = () => {
  const live = useLiveScreen();
  const pager = useLivePager();
  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        <ShiftLight rpm={live.rpm} height={live.layout.shiftLightHeight} />
        <PageChips page={pager.page} onSelect={pager.select} />
        <LivePager
          pager={pager}
          columns={live.layout.columns}
          paused={live.paused}
          nowMs={live.nowMs}
          valueSize={live.layout.valueSize}
        />
      </View>
      <LinkFooter onDisplay={live.openDisplay} />
      <DisplaySheet
        visible={live.displayOpen}
        dashConnected={live.dashConnected}
        onClose={live.closeDisplay}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: UiColors.bg },
  body: { flex: 1, padding: 12, gap: 10 },
});

export default LiveScreen;
