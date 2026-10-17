import { useDeviceStore } from "../stores/device.store";
import { useSignalsStore } from "../stores/signals.store";
import { usePhoneBatteryStore } from "../stores/phone-battery.store";
import { isBatteryBannerDue } from "../lib/phone-battery";
import { resolveOverlays, type OverlayStack } from "../lib/overlay-stack";
import { useAlertViews } from "./use-alerts";
import { useLink } from "./use-link";
import { useFirmwareFlowStore } from "../stores/firmware-stores";

const useBatteryBannerDue = (): boolean =>
  usePhoneBatteryStore((s) =>
    isBatteryBannerDue(s.levelPercent, s.dismissedStatus),
  );

const useNoDataWhileLinked = (): boolean =>
  useSignalsStore((s) => !s.isLive && s.staleSinceMs > 0);

export const useOverlayStack = (): OverlayStack => {
  const link = useLink();
  const alerts = useAlertViews();
  const hasError = useDeviceStore((s) => s.error !== null);
  const hasLinkProblem = useDeviceStore((s) => s.linkProblem !== null);
  const noData = useNoDataWhileLinked();
  const batteryLow = useBatteryBannerDue();
  const firmwareUpdate = useFirmwareFlowStore((s) => s.view.kind !== "closed");
  const connected = link === "connected";
  return resolveOverlays({
    alertHolds: alerts.takeover.length > 0,
    firmwareUpdate,
    reconnectFailed: hasError && link !== "reconnecting" && link !== "demo",
    reconnecting: link === "reconnecting",
    alertStrip: alerts.strips.length > 0,
    linkProblem: connected && hasLinkProblem,
    noData: connected && noData,
    batteryLow,
  });
};
