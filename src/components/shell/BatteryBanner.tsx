import { Pressable, StyleSheet, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import {
  dismissBatteryBanner,
  usePhoneBatteryStore,
} from "../../stores/phone-battery.store";
import { Banner } from "./Banner";

const BANNER_HEIGHT = 68;
const ICON_SIZE = 26;
const DISMISS_SIZE = 48;
const CROSS_SIZE = 20;

const BatteryIcon = () => (
  <Svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 24 24"
    fill="none"
    stroke={UiColors.warning}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M4 7h13a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
    <Path d="M22 11v2" />
    <Path
      d="M4.5 9h2a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 .5-.5z"
      fill={UiColors.warning}
      stroke="none"
    />
  </Svg>
);

const CrossIcon = () => (
  <Svg
    width={CROSS_SIZE}
    height={CROSS_SIZE}
    viewBox="0 0 24 24"
    fill="none"
    stroke={UiColors.warningTextStrong}
    strokeWidth={2.5}
    strokeLinecap="round"
  >
    <Path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const BatteryBanner = () => {
  const percent = usePhoneBatteryStore((s) => s.levelPercent);
  if (percent === null) return null;
  return (
    <Banner height={BANNER_HEIGHT}>
      <BatteryIcon />
      <Text style={styles.body}>
        <Text style={styles.lead}>{STRINGS.banners.batteryLead(percent)}</Text>
        {` ${STRINGS.banners.batteryBody}`}
      </Text>
      <Pressable
        style={styles.dismiss}
        onPress={dismissBatteryBanner}
        accessibilityRole="button"
        accessibilityLabel={STRINGS.banners.dismiss}
      >
        <CrossIcon />
      </Pressable>
    </Banner>
  );
};

const styles = StyleSheet.create({
  body: { flex: 1, fontSize: 14, lineHeight: 19, color: UiColors.warningText },
  lead: { fontWeight: "700", color: UiColors.warningTextStrong },
  dismiss: {
    width: DISMISS_SIZE,
    height: DISMISS_SIZE,
    borderRadius: UiRadius.control,
    alignItems: "center",
    justifyContent: "center",
  },
});
