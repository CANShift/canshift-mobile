import { startLocalAlertFeed } from "./alert-feeds";
import { startAlertCues } from "./alert-cues";
import { startAlertNotices } from "./alert-notices";

export const startAlertServices = (): (() => void) => {
  const stops = [startLocalAlertFeed(), startAlertCues(), startAlertNotices()];
  return () => {
    stops.forEach((stop) => {
      stop();
    });
  };
};
