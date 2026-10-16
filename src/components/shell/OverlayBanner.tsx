import { useOverlayStack } from "../../hooks/use-overlay-stack";
import type { Banner } from "../../lib/overlay-stack";
import { ReconnectingBanner } from "./ReconnectingBanner";
import { LinkProblemBanner } from "./LinkProblemBanner";
import { NoDataBanner } from "./NoDataBanner";
import { BatteryBanner } from "./BatteryBanner";

const BANNERS: Record<Banner, () => React.JSX.Element | null> = {
  reconnecting: ReconnectingBanner,
  linkProblem: LinkProblemBanner,
  noData: NoDataBanner,
  batteryLow: BatteryBanner,
  none: () => null,
};

export const OverlayBanner = () => {
  const Rendered = BANNERS[useOverlayStack().banner];
  return <Rendered />;
};
