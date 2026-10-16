import { StyleSheet, View } from "react-native";
import { TILES_PER_PAGE, type LiveTileSpec } from "../../lib/live-tiles";
import { LiveTile } from "./LiveTile";

const GAP = 10;

export interface LiveGridProps {
  tiles: readonly LiveTileSpec[];
  columns: number;
  paused: boolean;
  nowMs: number;
  valueSize: number;
}

type Slot = LiveTileSpec | null;

const rowsOf = (tiles: readonly LiveTileSpec[], columns: number): Slot[][] => {
  const slots: Slot[] = Array.from(
    { length: TILES_PER_PAGE },
    (_, index) => tiles[index] ?? null,
  );
  return Array.from({ length: TILES_PER_PAGE / columns }, (_, row) =>
    slots.slice(row * columns, (row + 1) * columns),
  );
};

export const LiveGrid = ({
  tiles,
  columns,
  paused,
  nowMs,
  valueSize,
}: LiveGridProps) => (
  <View style={styles.grid}>
    {rowsOf(tiles, columns).map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((spec, index) =>
          spec === null ? (
            <View key={`empty-${String(index)}`} style={styles.empty} />
          ) : (
            <LiveTile
              key={spec.signal}
              spec={spec}
              paused={paused}
              nowMs={nowMs}
              valueSize={valueSize}
            />
          ),
        )}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: { flex: 1, gap: GAP },
  row: { flex: 1, flexDirection: "row", gap: GAP },
  empty: { flex: 1 },
});
