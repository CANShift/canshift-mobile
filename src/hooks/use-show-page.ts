import { useCallback, useEffect, useRef, useState } from "react";
import { showDashPage } from "../services/dash-pages";
import { useDashPagesStore } from "../stores/dash-pages.store";
import { reportFailure } from "../lib/report-dash-failure";
import { pageLabel } from "../lib/page-label";
import { PAGES_STRINGS } from "../pages-strings";

const SHOW_PAGE_CONFIRM_MS = 2000;

export interface ShowPageModel {
  pendingId: string | null;
  show: (pageId: string) => void;
}

const confirmOrReport = (pageId: string): void => {
  if (useDashPagesStore.getState().onScreenId === pageId) return;
  reportFailure(
    "Show page",
    `the dash still shows another page than ${pageId}`,
    PAGES_STRINGS.notSwitched(pageLabel(pageId)),
  );
};

export const useShowPage = (): ShowPageModel => {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTimer = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => stopTimer, [stopTimer]);
  const show = useCallback(
    (pageId: string) => {
      stopTimer();
      setPendingId(pageId);
      timer.current = setTimeout(() => {
        timer.current = null;
        setPendingId(null);
        confirmOrReport(pageId);
      }, SHOW_PAGE_CONFIRM_MS);
      showDashPage(pageId).catch((err: unknown) => {
        stopTimer();
        setPendingId(null);
        reportFailure("Show page", err, PAGES_STRINGS.sendFailed);
      });
    },
    [stopTimer],
  );
  return { pendingId, show };
};
