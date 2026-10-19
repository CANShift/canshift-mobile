import * as Notifications from "expo-notifications";
import { AppState } from "react-native";
import { reportFailure } from "../../lib/report-dash-failure";
import { STRINGS } from "../../strings";

export interface PhoneNotification {
  id: string;
  title: string;
  body: string;
}

const SILENT_IN_FOREGROUND: Notifications.NotificationBehavior = {
  shouldShowBanner: false,
  shouldShowList: false,
  shouldPlaySound: false,
  shouldSetBadge: false,
};

export const keepNotificationsSilentInForeground = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: () => Promise.resolve(SILENT_IN_FOREGROUND),
  });
};

export const isAppInBackground = (): boolean =>
  AppState.currentState !== "active";

export const postNotification = async ({
  id,
  title,
  body,
}: PhoneNotification): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: { title, body, sound: true },
      trigger: null,
    });
  } catch (err) {
    reportFailure(`Notification ${id}`, err, STRINGS.notifications.postFailed);
  }
};

export const dismissNotification = async (id: string): Promise<void> => {
  try {
    await Notifications.dismissNotificationAsync(id);
  } catch (err) {
    reportFailure(
      `Notification ${id} dismissal`,
      err,
      STRINGS.notifications.postFailed,
    );
  }
};
