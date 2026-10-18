import { FlatList, StyleSheet, Text } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { useSendConsole } from "../../hooks/use-send-console";
import { SendWarning } from "./SendWarning";
import { SentCommandCard } from "./SentCommandCard";
import { SendComposer } from "./SendComposer";

export const SendTab = () => {
  const send = useSendConsole();
  if (!send.canSend)
    return (
      <Text style={styles.unavailable}>{STRINGS.console.sendUnavailable}</Text>
    );
  return (
    <>
      <SendWarning />
      <FlatList
        style={styles.history}
        contentContainerStyle={styles.historyContent}
        data={send.history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SentCommandCard sent={item} />}
      />
      <SendComposer send={send} />
    </>
  );
};

const styles = StyleSheet.create({
  history: { flex: 1 },
  historyContent: { gap: 10 },
  unavailable: {
    padding: 16,
    fontSize: 15,
    lineHeight: 21,
    color: UiColors.textMuted,
    textAlign: "center",
  },
});
