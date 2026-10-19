import { useDeviceStore } from "../../stores/device.store";
import { STRINGS } from "../../strings";
import {
  dismissNotification,
  isAppInBackground,
  postNotification,
} from "./notifier";

const DASH_LOST_ID = "dash-lost";

let posted = false;

export const notifyDashLost = (): void => {
  if (posted || !isAppInBackground()) return;
  posted = true;
  void postNotification({
    id: DASH_LOST_ID,
    title: STRINGS.notifications.dashLostTitle,
    body: STRINGS.notifications.dashLostBody,
  });
};

export const startDashLossNotifications = (): (() => void) => {
  posted = false;
  return useDeviceStore.subscribe((next, previous) => {
    if (!posted || next.connectionState !== "connected") return;
    if (previous.connectionState === "connected") return;
    posted = false;
    void dismissNotification(DASH_LOST_ID);
  });
};
