import { create } from "zustand";

export type PageListState = "loading" | "ready" | "unsupported" | "failed";

interface DashPagesState {
  listState: PageListState;
  pageIds: readonly string[];
  onScreenId: string | null;
  setPages: (pageIds: readonly string[]) => void;
  setListState: (listState: PageListState) => void;
  setOnScreen: (onScreenId: string | null) => void;
  reset: () => void;
}

const INITIAL = {
  listState: "loading",
  pageIds: [],
  onScreenId: null,
} satisfies Partial<DashPagesState>;

export const useDashPagesStore = create<DashPagesState>()((set) => ({
  ...INITIAL,
  setPages: (pageIds) => {
    set({ pageIds, listState: "ready" });
  },
  setListState: (listState) => {
    set({ listState });
  },
  setOnScreen: (onScreenId) => {
    set({ onScreenId });
  },
  reset: () => {
    set(INITIAL);
  },
}));

export const isPageListStale = (state: {
  listState: PageListState;
  pageIds: readonly string[];
  onScreenId: string | null;
}): boolean =>
  state.listState === "ready" &&
  state.onScreenId !== null &&
  !state.pageIds.includes(state.onScreenId);
