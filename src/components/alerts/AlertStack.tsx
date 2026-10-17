import { ScrollView, StyleSheet } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import type { AlertEntry } from "../../lib/alert-model";
import { BigButton } from "../buttons/BigButton";
import { AlertCard } from "./AlertCard";

export interface AlertStackProps {
  entries: readonly AlertEntry[];
  onAcknowledge: (entry: AlertEntry) => void;
  onMuteAll: () => void;
}

export const AlertStack = ({
  entries,
  onAcknowledge,
  onMuteAll,
}: AlertStackProps) => (
  <>
    <ScrollView style={styles.list} contentContainerStyle={styles.content}>
      {entries.map((entry) => (
        <AlertCard
          key={entry.key}
          entry={entry}
          onAcknowledge={() => {
            onAcknowledge(entry);
          }}
        />
      ))}
    </ScrollView>
    <BigButton
      label={STRINGS.alert.muteAll}
      tone="onAlert"
      height={TouchTarget.driving + 8}
      onPress={onMuteAll}
      glyph="mute"
    />
  </>
);

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { gap: 14 },
});
