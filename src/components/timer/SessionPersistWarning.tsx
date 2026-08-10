import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Colors, Spacing, Typography } from "../../theme";

export interface SessionPersistWarningProps {
  onDismiss: () => void;
}

const SessionPersistWarning = ({ onDismiss }: SessionPersistWarningProps) => (
  <Pressable
    style={styles.banner}
    onPress={onDismiss}
    accessibilityRole="button"
    accessibilityLabel="Lap sessions are not being saved. Tap to dismiss."
  >
    <Text style={styles.title}>LAPS NOT SAVED</Text>
    <Text style={styles.body}>
      This session could not be written to storage — it will be lost when the
      app closes. Free up space and lap again. Tap to dismiss.
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
    borderRadius: 6,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  title: {
    color: Colors.danger,
    fontSize: Typography.xs,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  body: { color: Colors.textDim, fontSize: Typography.sm },
});

export default SessionPersistWarning;
