import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { useDeviceStore } from "../../stores/device.store";
import { bleErrorMessage } from "../../services/ble-error-message";
import { Banner } from "./Banner";
import { BannerTag } from "./BannerTag";

const BANNER_HEIGHT = 64;

export const LinkProblemBanner = () => {
  const problem = useDeviceStore((s) => s.linkProblem);
  if (problem === null) return null;
  const message = bleErrorMessage(problem);
  return (
    <Banner height={BANNER_HEIGHT}>
      <BannerTag label={STRINGS.banners.noDataTag} />
      <View style={styles.copy}>
        <Text style={styles.title}>{message.title}</Text>
        <Text style={styles.body}>{message.body}</Text>
      </View>
    </Banner>
  );
};

const styles = StyleSheet.create({
  copy: { flex: 1 },
  title: { fontSize: 15, fontWeight: "700", color: UiColors.warningTextStrong },
  body: { fontSize: 13, lineHeight: 18, color: UiColors.warningText },
});
