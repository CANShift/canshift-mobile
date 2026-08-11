import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { Card } from "../ui";
import { Colors, Fonts, Typography, HitSlop } from "../../theme";

export interface ReconnectStripProps {
  attempt: number;
  maxAttempts: number;
  onCancel: () => void;
}

export const ReconnectStrip = ({
  attempt,
  maxAttempts,
  onCancel,
}: ReconnectStripProps) => (
  <Card
    variant="accent"
    padding="none"
    className="w-full flex-row items-center gap-2 mb-3 px-3 py-2"
  >
    <ActivityIndicator color={Colors.accent} size="small" />
    <Text style={styles.text}>
      {`Reconnecting to dashboard… (${String(attempt)}/${String(maxAttempts)})`}
    </Text>
    <TouchableOpacity
      onPress={onCancel}
      hitSlop={HitSlop.default}
      accessibilityRole="button"
      accessibilityLabel="Cancel reconnecting"
    >
      <Text style={styles.cancel}>Cancel</Text>
    </TouchableOpacity>
  </Card>
);

const styles = StyleSheet.create({
  text: {
    fontFamily: Fonts.ui,
    fontSize: Typography.sm,
    color: Colors.text,
    flex: 1,
  },
  cancel: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.sm,
    color: Colors.accent,
  },
});
