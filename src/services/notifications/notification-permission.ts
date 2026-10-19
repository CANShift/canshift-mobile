import * as Notifications from "expo-notifications";
import { AppState } from "react-native";
import { useDeviceStore } from "../../stores/device.store";
import {
  setNotificationPermission,
  type NotificationPermission,
} from "../../stores/notification-permission.store";
import { reportFailure } from "../../lib/report-dash-failure";
import { STRINGS } from "../../strings";

const ALERTS_AND_SOUNDS: Notifications.NotificationPermissionsRequest = {
  ios: { allowAlert: true, allowSound: true, allowBadge: false },
};

const permissionOf = ({
  granted,
  canAskAgain,
}: Notifications.NotificationPermissionsStatus): NotificationPermission => {
  if (granted) return "granted";
  return canAskAgain ? "undetermined" : "denied";
};

const settle = async (
  action: string,
  read: () => Promise<Notifications.NotificationPermissionsStatus>,
): Promise<NotificationPermission> => {
  try {
    const permission = permissionOf(await read());
    setNotificationPermission(permission);
    return permission;
  } catch (err) {
    reportFailure(action, err, STRINGS.notifications.permissionFailed);
    return "unknown";
  }
};

const refreshPermission = (): Promise<NotificationPermission> =>
  settle("Notification permission check", () =>
    Notifications.getPermissionsAsync(),
  );

const askAfterFirstDash = async (): Promise<void> => {
  if ((await refreshPermission()) !== "undetermined") return;
  await settle("Notification permission request", () =>
    Notifications.requestPermissionsAsync(ALERTS_AND_SOUNDS),
  );
};

export const startNotificationPermission = (): (() => void) => {
  void refreshPermission();
  const appState = AppState.addEventListener("change", (next) => {
    if (next === "active") void refreshPermission();
  });
  const unsubscribe = useDeviceStore.subscribe((next, previous) => {
    if (next.mode === "ble" && previous.mode !== "ble")
      void askAfterFirstDash();
  });
  return () => {
    appState.remove();
    unsubscribe();
  };
};
