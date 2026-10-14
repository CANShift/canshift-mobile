import { View } from "react-native";
import { DASH_TYPE, scaledPx } from "../../lib/dash-geometry";

export interface DashBarProps {
  fraction: number;
  scale: number;
  fill: string;
  track: string;
}

export const DashBar = ({ fraction, scale, fill, track }: DashBarProps) => (
  <View
    style={{
      flexDirection: "row",
      height: scaledPx(DASH_TYPE.barHeightPx, scale),
      marginTop: scaledPx(DASH_TYPE.barGapPx, scale),
      backgroundColor: track,
    }}
  >
    <View style={{ flex: fraction, backgroundColor: fill }} />
    <View style={{ flex: 1 - fraction }} />
  </View>
);
