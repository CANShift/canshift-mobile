import { useAlertsStore } from "../../stores/alerts.store";
import { alertViews } from "../../lib/alert-views";
import { alertNotificationBody } from "../../lib/alert-text";
import type { AlertEntry, AlertKey } from "../../lib/alert-model";
import {
  NO_ALERT_NOTIFICATIONS,
  planAlertNotifications,
  type AlertNotificationPlan,
} from "../../lib/alert-notification-plan";
import {
  dismissNotification,
  isAppInBackground,
  postNotification,
} from "./notifier";

const notificationId = (key: AlertKey): string => `alert:${key}`;

const notify = (entry: AlertEntry): Promise<void> =>
  postNotification({
    id: notificationId(entry.key),
    title: entry.name,
    body: alertNotificationBody(entry),
  });

const apply = ({ post, dismiss }: AlertNotificationPlan): void => {
  dismiss.forEach((key) => void dismissNotification(notificationId(key)));
  post.forEach((entry) => void notify(entry));
};

export const startAlertNotifications = (): (() => void) => {
  let state = NO_ALERT_NOTIFICATIONS;
  return useAlertsStore.subscribe((next, previous) => {
    if (next.feed !== previous.feed) return;
    const plan = planAlertNotifications(
      state,
      alertViews(next).takeover,
      isAppInBackground(),
    );
    state = plan.next;
    apply(plan);
  });
};
