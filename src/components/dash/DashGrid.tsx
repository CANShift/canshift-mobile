import { View } from "react-native";
import type { DashPage } from "../../lib/dash-pages";
import type { DashPalette } from "../../lib/dash-palette";
import { dashGutter } from "../../lib/dash-geometry";
import DashValueWidget from "./DashValueWidget";

export interface DashGridProps {
  page: DashPage;
  scale: number;
  palette: DashPalette;
}

export const DashGrid = ({ page, scale, palette }: DashGridProps) => {
  const gutter = dashGutter(scale);
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignContent: "flex-start",
        columnGap: gutter,
        rowGap: gutter,
      }}
    >
      {page.widgets.map((spec) => (
        <DashValueWidget
          key={`${page.id}-${spec.kicker}`}
          spec={spec}
          scale={scale}
          palette={palette}
        />
      ))}
    </View>
  );
};
