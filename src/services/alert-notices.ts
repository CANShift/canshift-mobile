import { Toast } from "../components/ui/toast";
import { useAlertsStore } from "../stores/alerts.store";
import { clearedSources } from "../lib/alert-views";
import { STRINGS } from "../strings";

export const startAlertNotices = (): (() => void) =>
  useAlertsStore.subscribe((next, previous) => {
    if (next.feed !== previous.feed) return;
    for (const entry of clearedSources(previous.active, next.active)) {
      Toast.show({
        type: "success",
        text1: STRINGS.alert.backToNormal(entry.name),
      });
    }
  });
