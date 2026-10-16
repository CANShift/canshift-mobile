import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useShallow } from "zustand/react/shallow";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import { useReconnectStore } from "../../stores/reconnect.store";
import { cancelReconnectToScan } from "../../services/session-exit";
import { Banner } from "./Banner";

const BANNER_HEIGHT = 68;
const CANCEL_HEIGHT = 48;

export const ReconnectingBanner = () => {
  const { attempt, maxAttempts } = useReconnectStore(
    useShallow((s) => ({ attempt: s.attempt, maxAttempts: s.maxAttempts })),
  );
  return (
    <Banner height={BANNER_HEIGHT}>
      <ActivityIndicator color={UiColors.warning} />
      <View style={styles.copy}>
        <Text style={styles.title}>{STRINGS.banners.reconnectingTitle}</Text>
        <Text style={styles.body}>
          {STRINGS.banners.reconnectingAttempt(attempt, maxAttempts)}
        </Text>
      </View>
      <Pressable
        style={styles.cancel}
        onPress={cancelReconnectToScan}
        accessibilityRole="button"
        accessibilityLabel={STRINGS.connect.cancel}
      >
        <Text style={styles.cancelText}>{STRINGS.connect.cancel}</Text>
      </Pressable>
    </Banner>
  );
};

const styles = StyleSheet.create({
  copy: { flex: 1 },
  title: { fontSize: 15, fontWeight: "700", color: UiColors.warningTextStrong },
  body: { fontSize: 13, color: UiColors.warningText },
  cancel: {
    height: CANCEL_HEIGHT,
    paddingHorizontal: 16,
    borderRadius: UiRadius.control,
    borderWidth: 1,
    borderColor: UiColors.warningBorder,
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: UiColors.warningTextStrong,
  },
});
