import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { BannerButton } from "../shell/BannerButton";
import { Banner } from "../shell/Banner";

export interface ScanReconnectBannerProps {
  dashName: string;
  onCancel: () => void;
}

export const ScanReconnectBanner = ({
  dashName,
  onCancel,
}: ScanReconnectBannerProps) => (
  <Banner height={64}>
    <ActivityIndicator color={UiColors.warning} />
    <Text style={styles.text}>{STRINGS.connect.reconnectingTo(dashName)}</Text>
    <BannerButton label={STRINGS.connect.cancel} onPress={onCancel} />
  </Banner>
);

const styles = StyleSheet.create({
  text: { flex: 1, fontSize: 15, lineHeight: 20, color: UiColors.warningText },
});
