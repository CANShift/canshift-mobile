import type { PageListState } from "../stores/dash-pages.store";
import { PAGES_STRINGS } from "../pages-strings";

export type PagesViewKind =
  "loading" | "unsupported" | "failed" | "empty" | "list";

export type ShowPageState = "onScreen" | "sending" | "ready" | "none";

export interface PagesNoticeCopy {
  title: string;
  body: string;
  retry: boolean;
}

export const PAGES_NOTICES: Record<
  Exclude<PagesViewKind, "list">,
  PagesNoticeCopy
> = {
  loading: {
    title: PAGES_STRINGS.loadingTitle,
    body: PAGES_STRINGS.loadingBody,
    retry: false,
  },
  unsupported: {
    title: PAGES_STRINGS.unsupportedTitle,
    body: PAGES_STRINGS.unsupportedBody,
    retry: false,
  },
  failed: {
    title: PAGES_STRINGS.failedTitle,
    body: PAGES_STRINGS.failedBody,
    retry: true,
  },
  empty: {
    title: PAGES_STRINGS.emptyTitle,
    body: PAGES_STRINGS.emptyBody,
    retry: false,
  },
};

const VIEW_BY_LIST_STATE: Record<PageListState, PagesViewKind> = {
  loading: "loading",
  unsupported: "unsupported",
  failed: "failed",
  ready: "list",
};

export const pagesViewKind = (
  listState: PageListState,
  pageCount: number,
): PagesViewKind => {
  const kind = VIEW_BY_LIST_STATE[listState];
  return kind === "list" && pageCount === 0 ? "empty" : kind;
};

export interface ShowPageInputs {
  selectedId: string | null;
  onScreenId: string | null;
  pendingId: string | null;
}

export const showPageState = ({
  selectedId,
  onScreenId,
  pendingId,
}: ShowPageInputs): ShowPageState => {
  if (selectedId === null) return "none";
  if (selectedId === onScreenId) return "onScreen";
  return selectedId === pendingId ? "sending" : "ready";
};

export interface ShowPageLook {
  label: (pageLabel: string) => string;
  enabled: boolean;
}

export const SHOW_PAGE_LOOKS: Record<ShowPageState, ShowPageLook> = {
  none: { label: () => PAGES_STRINGS.alreadyOnScreen, enabled: false },
  onScreen: { label: () => PAGES_STRINGS.alreadyOnScreen, enabled: false },
  sending: { label: () => PAGES_STRINGS.switching, enabled: false },
  ready: { label: PAGES_STRINGS.showOnDash, enabled: true },
};

export const effectiveSelection = (
  pageIds: readonly string[],
  chosenId: string | null,
  onScreenId: string | null,
): string | null => {
  if (chosenId !== null && pageIds.includes(chosenId)) return chosenId;
  if (onScreenId !== null && pageIds.includes(onScreenId)) return onScreenId;
  return pageIds[0] ?? null;
};
