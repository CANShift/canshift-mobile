import type { BuiltInAlertSource } from "@canshift/core";
import { builtInOrigin, type AlertEntry } from "./alert-model";
import {
  NO_ALERT_NOTIFICATIONS,
  planAlertNotifications,
  type AlertNotificationState,
} from "./alert-notification-plan";

const entry = (source: BuiltInAlertSource): AlertEntry => ({
  key: source,
  origin: builtInOrigin(source),
  name: source,
  unit: "",
  decimals: 0,
  value: 1,
  limit: null,
  dashAcknowledged: false,
  activeSeconds: 0,
});

const OIL = entry("oil_pressure");
const COOLANT = entry("coolant_temp");

const run = (
  frames: readonly (readonly AlertEntry[])[],
  inBackground: boolean,
  start: AlertNotificationState = NO_ALERT_NOTIFICATIONS,
) =>
  frames.reduce(
    (acc, frame) => {
      const plan = planAlertNotifications(acc.state, frame, inBackground);
      return {
        state: plan.next,
        post: [...acc.post, ...plan.post.map((e) => e.key)],
        dismiss: [...acc.dismiss, ...plan.dismiss],
      };
    },
    { state: start, post: [] as string[], dismiss: [] as string[] },
  );

describe("planAlertNotifications", () => {
  it("posts once at the onset while the app is in the background", () => {
    expect(run([[OIL], [OIL], [OIL]], true).post).toEqual(["oil_pressure"]);
  });

  it("gives a different alert that starts firing its own notification", () => {
    expect(run([[OIL], [OIL, COOLANT]], true).post).toEqual([
      "oil_pressure",
      "coolant_temp",
    ]);
  });

  it("posts nothing in the foreground, and nothing later for the same onset", () => {
    const seen = run([[OIL]], false);
    expect(seen.post).toEqual([]);
    expect(run([[OIL]], true, seen.state).post).toEqual([]);
  });

  it("clears the notification when the alert stops firing", () => {
    const { dismiss } = run([[OIL], []], true);
    expect(dismiss).toEqual(["oil_pressure"]);
  });

  it("clears the notification when the alert leaves the takeover", () => {
    const { dismiss, state } = run([[OIL, COOLANT], [COOLANT]], true);
    expect(dismiss).toEqual(["oil_pressure"]);
    expect([...state.posted]).toEqual(["coolant_temp"]);
  });

  it("only clears notifications it posted", () => {
    expect(run([[OIL], []], false).dismiss).toEqual([]);
  });

  it("posts again when the same alert fires anew after clearing", () => {
    expect(run([[OIL], [], [OIL]], true).post).toEqual([
      "oil_pressure",
      "oil_pressure",
    ]);
  });
});
