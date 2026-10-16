import { StyleSheet, Text, View } from "react-native";
import type { TileLook } from "../../lib/tile-look";
import { ClockIcon } from "./ClockIcon";

const TAG_SIZE = 12;
const CLOCK_SIZE = 12;

export interface TileTagProps {
  tag: string;
  look: TileLook;
}

export const TileTag = ({ tag, look }: TileTagProps) => (
  <View style={styles.tag}>
    {look.showsClock ? (
      <ClockIcon color={look.tagColor} size={CLOCK_SIZE} />
    ) : null}
    <Text
      style={[
        styles.text,
        { color: look.tagColor },
        look.tagCaps ? styles.caps : null,
      ]}
    >
      {tag}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  tag: { flexDirection: "row", alignItems: "center", gap: 4 },
  text: { fontSize: TAG_SIZE, fontWeight: "700" },
  caps: { textTransform: "uppercase", letterSpacing: TAG_SIZE * 0.04 },
});
