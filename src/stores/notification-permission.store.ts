import { create } from "zustand";

export type NotificationPermission =
  "unknown" | "undetermined" | "granted" | "denied";

interface NotificationPermissionState {
  permission: NotificationPermission;
}

export const useNotificationPermissionStore =
  create<NotificationPermissionState>()(() => ({ permission: "unknown" }));

export const setNotificationPermission = (
  permission: NotificationPermission,
): void => {
  useNotificationPermissionStore.setState({ permission });
};
