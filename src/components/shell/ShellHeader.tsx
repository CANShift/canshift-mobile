import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDeviceStore } from "../../stores/device.store";
import { useTrackSessionStore } from "../../stores/track-session.store";
import { headerBadge } from "../../lib/link-presentation";
import { useLink } from "../../hooks/use-link";
import { useIsLandscape } from "../../hooks/use-is-landscape";
import { UiColors } from "../../theme/ui-tokens";
import { Header } from "./Header";
import { OverlayBanner } from "./OverlayBanner";

const PortraitHeader = () => {
  const link = useLink();
  const dashName = useDeviceStore((s) => s.deviceName);
  const isLogging = useTrackSessionStore((s) => s.recording);
  return (
    <Header
      link={link}
      dashName={dashName}
      badge={headerBadge(link, isLogging)}
    />
  );
};

const LandscapeInset = () => {
  const insets = useSafeAreaInsets();
  return <View style={{ height: insets.top, backgroundColor: UiColors.bg }} />;
};

export const ShellHeader = () => {
  const Top = useIsLandscape() ? LandscapeInset : PortraitHeader;
  return (
    <View>
      <Top />
      <OverlayBanner />
    </View>
  );
};
