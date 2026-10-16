import { StyleSheet, View } from "react-native";
import { LIVE_TILES, type LiveTileSpec } from "../../lib/live-tiles";
import { LiveTile } from "./LiveTile";

const GAP = 10;

export interface LiveGridProps {
  columns: number;
  paused: boolean;
  nowMs: number;
  valueSize: number;
}

const rowsOf = (columns: number): LiveTileSpec[][] =>
  Array.from({ length: Math.ceil(LIVE_TILES.length / columns) }, (_, row) =>
    LIVE_TILES.slice(row * columns, (row + 1) * columns),
  );

export const LiveGrid = ({
  columns,
  paused,
  nowMs,
  valueSize,
}: LiveGridProps) => (
  <View style={styles.grid}>
    {rowsOf(columns).map((row) => (
      <View key={row[0]?.signal} style={styles.row}>
        {row.map((spec) => (
          <LiveTile
            key={spec.signal}
            spec={spec}
            paused={paused}
            nowMs={nowMs}
            valueSize={valueSize}
          />
        ))}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: { flex: 1, gap: GAP },
  row: { flex: 1, flexDirection: "row", gap: GAP },
});
