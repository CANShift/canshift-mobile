import { keepNotificationsSilentInForeground } from "./notifier";
import { startAlertNotifications } from "./alert-notifications";
import { startDashLossNotifications } from "./dash-loss-notifications";
import { startNotificationPermission } from "./notification-permission";

export const startNotificationServices = (): (() => void) => {
  keepNotificationsSilentInForeground();
  const stops = [
    startAlertNotifications(),
    startDashLossNotifications(),
    startNotificationPermission(),
  ];
  return () => {
    stops.forEach((stop) => {
      stop();
    });
  };
};
