import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { Colors, Typography, Spacing, Fonts } from "../../theme";
import { useDeviceStore } from "../../stores/device.store";
import { log } from "../../stores/log.store";
import { sendCmd } from "../../services/ble.service";
import { errText } from "../../lib/error-text";
import { Button } from "../ui";
import { ConsoleEmpty } from "./ConsoleEmpty";

export const SendTab = () => {
  const { mode, connectionState } = useDeviceStore(
    useShallow((s) => ({
      mode: s.mode,
      connectionState: s.connectionState,
    })),
  );
  const [command, setCommand] = useState("");
  const [sending, setSending] = useState(false);
  const canSend = mode === "ble" && connectionState === "connected";

  const handleSend = useCallback(async () => {
    const trimmed = command.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await sendCmd(trimmed);
      log("info", `Console → sent "${trimmed}"`);
      setCommand("");
    } catch (err) {
      Alert.alert("Send failed", errText(err));
    } finally {
      setSending(false);
    }
  }, [command, sending]);

  if (!canSend) {
    return (
      <ConsoleEmpty>
        {mode === "sim"
          ? "Command send isn't available in demo mode."
          : "Connect to a dashboard over Bluetooth to send commands."}
      </ConsoleEmpty>
    );
  }

  return (
    <View style={styles.body}>
      <Text style={styles.label}>Command</Text>
      <TextInput
        style={styles.input}
        value={command}
        onChangeText={setCommand}
        placeholder="e.g. reset_odo"
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={() => void handleSend()}
        returnKeyType="send"
        accessibilityLabel="Command to send"
      />
      <Button
        onPress={() => void handleSend()}
        disabled={!command.trim() || sending}
        accessibilityLabel="Send command"
      >
        {sending ? "Sending…" : "Send"}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  body: { padding: Spacing.lg, gap: Spacing.sm },
  label: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.textMuted,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontFamily: Fonts.mono,
    fontSize: Typography.md,
  },
});
