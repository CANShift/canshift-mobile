import { ScrollView, StyleSheet, View } from "react-native";
import type { DashPage } from "../../lib/dash-pages";
import type { DashPalette } from "../../lib/dash-palette";
import { SCREEN_PADDING } from "../../theme";
import { dashGutter } from "../../lib/dash-geometry";
import { useDashScale } from "../../hooks/use-dash-scale";
import { DashGrid } from "./DashGrid";
import DashShiftLight from "./DashShiftLight";

export interface DashPanelProps {
  page: DashPage;
  palette: DashPalette;
}

export const DashPanel = ({ page, palette }: DashPanelProps) => {
  const { scale, onLayout } = useDashScale();
  const frame = {
    backgroundColor: palette.ground,
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: dashGutter(scale),
    gap: dashGutter(scale),
  };

  return (
    <ScrollView
      style={[styles.viewport, { backgroundColor: palette.ground }]}
      onLayout={onLayout}
      showsVerticalScrollIndicator={false}
    >
      {scale > 0 && (
        <View style={frame}>
          {page.shiftLight && (
            <DashShiftLight scale={scale} palette={palette} />
          )}
          <DashGrid page={page} scale={scale} palette={palette} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  viewport: { flex: 1 },
});
