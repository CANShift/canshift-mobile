import { StyleSheet, Text } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { useSignalsStore } from "../../stores/signals.store";
import { ageSeconds } from "../../lib/signal-staleness";
import { useNowMs } from "../../hooks/use-now-ms";
import { Banner } from "./Banner";
import { BannerTag } from "./BannerTag";

const BANNER_HEIGHT = 64;

const useNoDataSinceMs = (): number =>
  useSignalsStore((s) =>
    s.lastUpdateMs > 0 ? s.lastUpdateMs : s.staleSinceMs,
  );

export const NoDataBanner = () => {
  const sinceMs = useNoDataSinceMs();
  const nowMs = useNowMs(true);
  return (
    <Banner height={BANNER_HEIGHT}>
      <BannerTag label={STRINGS.banners.noDataTag} />
      <Text style={styles.text}>
        {STRINGS.banners.noData(ageSeconds(sinceMs, nowMs))}
      </Text>
    </Banner>
  );
};

const styles = StyleSheet.create({
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    color: UiColors.warningText,
  },
});
