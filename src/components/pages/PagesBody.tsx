import type { PagesScreenModel } from "../../hooks/use-pages-screen";
import { PAGES_NOTICES, SHOW_PAGE_LOOKS } from "../../lib/pages-view";
import { pageLabel } from "../../lib/page-label";
import { PageList } from "./PageList";
import { PagesNotice } from "./PagesNotice";
import { ShowPageBar } from "./ShowPageBar";

export interface PagesBodyProps {
  pages: PagesScreenModel;
}

export const PagesBody = ({ pages }: PagesBodyProps) => {
  if (pages.view !== "list")
    return (
      <PagesNotice
        kind={pages.view}
        copy={PAGES_NOTICES[pages.view]}
        onRetry={pages.retry}
      />
    );
  const look = SHOW_PAGE_LOOKS[pages.showState];
  return (
    <>
      <PageList
        pageIds={pages.pageIds}
        onScreenId={pages.onScreenId}
        selectedId={pages.selectedId}
        onSelect={pages.select}
      />
      <ShowPageBar
        label={look.label(pageLabel(pages.selectedId ?? ""))}
        enabled={look.enabled}
        onPress={pages.showSelected}
      />
    </>
  );
};
