import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { refreshPages } from "../services/dash-pages";
import { isPageListStale, useDashPagesStore } from "../stores/dash-pages.store";
import {
  effectiveSelection,
  pagesViewKind,
  showPageState,
  type PagesViewKind,
  type ShowPageState,
} from "../lib/pages-view";
import { useShowPage } from "./use-show-page";

export interface PagesScreenModel {
  view: PagesViewKind;
  pageIds: readonly string[];
  onScreenId: string | null;
  selectedId: string | null;
  showState: ShowPageState;
  select: (pageId: string) => void;
  showSelected: () => void;
  retry: () => void;
}

const useDashPages = () =>
  useDashPagesStore(
    useShallow((s) => ({
      listState: s.listState,
      pageIds: s.pageIds,
      onScreenId: s.onScreenId,
    })),
  );

export const usePagesScreen = (): PagesScreenModel => {
  const pages = useDashPages();
  const [chosenId, setChosenId] = useState<string | null>(null);
  const { pendingId, show } = useShowPage();
  const stale = isPageListStale(pages);
  const needsRead = pages.listState !== "ready" || stale;
  useEffect(() => {
    if (needsRead) void refreshPages();
  }, [needsRead]);
  const selectedId = effectiveSelection(
    pages.pageIds,
    chosenId,
    pages.onScreenId,
  );
  return {
    view: pagesViewKind(pages.listState, pages.pageIds.length),
    pageIds: pages.pageIds,
    onScreenId: pages.onScreenId,
    selectedId,
    showState: showPageState({ selectedId, pendingId, ...pages }),
    select: setChosenId,
    showSelected: () => {
      if (selectedId !== null) show(selectedId);
    },
    retry: () => void refreshPages(),
  };
};
