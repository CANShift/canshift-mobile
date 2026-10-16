import { useDeviceStore } from "../stores/device.store";
import { useSignalsStore } from "../stores/signals.store";
import { usePhoneBatteryStore } from "../stores/phone-battery.store";
import { isBatteryBannerDue } from "../lib/phone-battery";
import { resolveOverlays, type OverlayStack } from "../lib/overlay-stack";
import { useCriticalAlertHolds } from "./use-critical-alert";
import { useLink } from "./use-link";

const useBatteryBannerDue = (): boolean =>
  usePhoneBatteryStore((s) =>
    isBatteryBannerDue(s.levelPercent, s.dismissedStatus),
  );

const useNoDataWhileLinked = (): boolean =>
  useSignalsStore((s) => !s.isLive && s.staleSinceMs > 0);

export const useOverlayStack = (): OverlayStack => {
  const link = useLink();
  const alertHolds = useCriticalAlertHolds();
  const hasError = useDeviceStore((s) => s.error !== null);
  const hasLinkProblem = useDeviceStore((s) => s.linkProblem !== null);
  const noData = useNoDataWhileLinked();
  const batteryLow = useBatteryBannerDue();
  const connected = link === "connected";
  return resolveOverlays({
    alertHolds,
    reconnectFailed: hasError && link !== "reconnecting" && link !== "demo",
    reconnecting: link === "reconnecting",
    linkProblem: connected && hasLinkProblem,
    noData: connected && noData,
    batteryLow,
  });
};
