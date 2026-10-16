import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { useReconnectStore } from "../../stores/reconnect.store";
import { cancelReconnectToScan } from "../../services/session-exit";
import { BannerButton } from "./BannerButton";
import { Banner } from "./Banner";

const BANNER_HEIGHT = 68;

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
      <BannerButton
        label={STRINGS.connect.cancel}
        onPress={cancelReconnectToScan}
      />
    </Banner>
  );
};

const styles = StyleSheet.create({
  copy: { flex: 1 },
  title: { fontSize: 15, fontWeight: "700", color: UiColors.warningTextStrong },
  body: { fontSize: 13, color: UiColors.warningText },
});
