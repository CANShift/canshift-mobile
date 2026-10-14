import React from "react";
import { Text, View } from "react-native";
import { Card, SectionLabel } from "@/components/ui";
import type { LapRow, LapTone } from "./lap-rows";

export interface LapListProps {
  rows: readonly LapRow[];
  emptyText: string;
}

const LAP_TONE_CLASS: Record<LapTone, string> = {
  ink: "text-text",
  accent: "text-accent",
};

const LapListRow = ({ row }: { row: LapRow }) => (
  <View className="flex-row items-center justify-between gap-3">
    <Text className="flex-1 text-sm text-text-dim">{row.label}</Text>
    <Text
      className={`font-mono text-base tabular-nums ${LAP_TONE_CLASS[row.tone]}`}
    >
      {row.lapText}
    </Text>
    {row.totalText !== null && (
      <Text className="font-mono text-sm tabular-nums text-text-muted">
        {row.totalText}
      </Text>
    )}
  </View>
);

const LapList = ({ rows, emptyText }: LapListProps) => (
  <Card className="gap-2">
    <SectionLabel>Laps</SectionLabel>
    {rows.length === 0 ? (
      <Text className="text-sm text-text-muted">{emptyText}</Text>
    ) : (
      rows.map((row) => <LapListRow key={row.key} row={row} />)
    )}
  </Card>
);

export default React.memo(LapList);
