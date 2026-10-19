import type { AlertEntry, AlertKey } from "./alert-model";

export interface AlertNotificationState {
  firing: ReadonlySet<AlertKey>;
  posted: ReadonlySet<AlertKey>;
}

export interface AlertNotificationPlan {
  next: AlertNotificationState;
  post: readonly AlertEntry[];
  dismiss: readonly AlertKey[];
}

export const NO_ALERT_NOTIFICATIONS: AlertNotificationState = {
  firing: new Set(),
  posted: new Set(),
};

export const planAlertNotifications = (
  state: AlertNotificationState,
  takeover: readonly AlertEntry[],
  inBackground: boolean,
): AlertNotificationPlan => {
  const firing = new Set(takeover.map((entry) => entry.key));
  const onsets = takeover.filter((entry) => !state.firing.has(entry.key));
  const post = inBackground ? onsets : [];
  const posted = [...state.posted];
  return {
    next: {
      firing,
      posted: new Set([
        ...posted.filter((key) => firing.has(key)),
        ...post.map((entry) => entry.key),
      ]),
    },
    post,
    dismiss: posted.filter((key) => !firing.has(key)),
  };
};
