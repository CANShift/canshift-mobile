import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { STRINGS } from "../../strings";
import {
  TouchTarget,
  UiColors,
  UiFonts,
  UiRadius,
} from "../../theme/ui-tokens";
import type { SendConsole } from "../../hooks/use-send-console";

interface SendComposerProps {
  send: SendConsole;
}

export const SendComposer = ({ send }: SendComposerProps) => (
  <View style={styles.composer}>
    <TextInput
      style={styles.input}
      value={send.command}
      onChangeText={send.setCommand}
      onSubmitEditing={() => void send.submit()}
      returnKeyType="send"
      autoCapitalize="none"
      autoCorrect={false}
      placeholder={STRINGS.console.command}
      placeholderTextColor={UiColors.textMuted}
      accessibilityLabel={STRINGS.console.command}
    />
    <Pressable
      style={[styles.send, send.ready ? null : styles.sendOff]}
      onPress={() => void send.submit()}
      disabled={!send.ready}
      accessibilityRole="button"
      accessibilityLabel={STRINGS.console.send}
      accessibilityState={{ disabled: !send.ready }}
    >
      <Text style={styles.sendText}>{STRINGS.console.send}</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  composer: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    height: TouchTarget.driving,
    paddingHorizontal: 14,
    borderRadius: UiRadius.tile,
    borderWidth: 2,
    borderColor: UiColors.text,
    backgroundColor: UiColors.surface,
    color: UiColors.text,
    fontSize: 16,
    fontFamily: UiFonts.numeric,
  },
  send: {
    height: TouchTarget.driving,
    paddingHorizontal: 20,
    borderRadius: UiRadius.tile,
    backgroundColor: UiColors.primaryBtn,
    justifyContent: "center",
  },
  sendOff: { backgroundColor: UiColors.surface2 },
  sendText: { fontSize: 17, fontWeight: "700", color: UiColors.onPrimary },
});
