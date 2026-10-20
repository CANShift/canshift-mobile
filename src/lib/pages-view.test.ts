import { effectiveSelection, pagesViewKind, showPageState } from "./pages-view";
import { pageLabel } from "./page-label";
import { isPageListStale } from "../stores/dash-pages.store";

const PAGES = ["street", "track", "engine"] as const;

describe("pagesViewKind", () => {
  it("shows the list once the dash sent at least one page", () => {
    expect(pagesViewKind("ready", 3)).toBe("list");
  });

  it("says the dash has no page when its list is empty", () => {
    expect(pagesViewKind("ready", 0)).toBe("empty");
  });

  it("keeps loading, unsupported and failed as their own notices", () => {
    expect(pagesViewKind("loading", 0)).toBe("loading");
    expect(pagesViewKind("unsupported", 0)).toBe("unsupported");
    expect(pagesViewKind("failed", 0)).toBe("failed");
  });
});

describe("showPageState", () => {
  it("has nothing to show when no page is selected", () => {
    const inputs = { selectedId: null, onScreenId: null, pendingId: null };
    expect(showPageState(inputs)).toBe("none");
  });

  it("disables the action for the page already on screen", () => {
    const inputs = {
      selectedId: "track",
      onScreenId: "track",
      pendingId: null,
    };
    expect(showPageState(inputs)).toBe("onScreen");
  });

  it("is switching while the dash hasn't confirmed the selected page", () => {
    const inputs = {
      selectedId: "track",
      onScreenId: "street",
      pendingId: "track",
    };
    expect(showPageState(inputs)).toBe("sending");
  });

  it("is ready for any other page", () => {
    const inputs = {
      selectedId: "engine",
      onScreenId: "street",
      pendingId: "track",
    };
    expect(showPageState(inputs)).toBe("ready");
  });
});

describe("effectiveSelection", () => {
  it("keeps the page the driver picked", () => {
    expect(effectiveSelection(PAGES, "engine", "street")).toBe("engine");
  });

  it("falls back to the page on screen, then the first page", () => {
    expect(effectiveSelection(PAGES, null, "track")).toBe("track");
    expect(effectiveSelection(PAGES, "gone", "nope")).toBe("street");
    expect(effectiveSelection([], null, null)).toBeNull();
  });
});

describe("pageLabel", () => {
  it("turns a page id into a readable name", () => {
    expect(pageLabel("street")).toBe("Street");
    expect(pageLabel("my_track-day")).toBe("My track day");
    expect(pageLabel("___")).toBe("___");
  });
});

describe("isPageListStale", () => {
  it("is stale when the dash shows a page the list doesn't hold", () => {
    const base = { listState: "ready", pageIds: PAGES } as const;
    expect(isPageListStale({ ...base, onScreenId: "timing" })).toBe(true);
    expect(isPageListStale({ ...base, onScreenId: "track" })).toBe(false);
    expect(isPageListStale({ ...base, onScreenId: null })).toBe(false);
  });
});
