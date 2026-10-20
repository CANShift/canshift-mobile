import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { useCanFeed } from "../../hooks/use-can-feed";
import { useCanDashFilter } from "../../hooks/use-can-dash-filter";
import {
  useCanMonitorView,
  type CanMonitorView,
  type CanViewState,
} from "../../hooks/use-can-monitor-view";
import { Glyph } from "../icons/Glyph";
import { EmptyCard } from "../cards/EmptyCard";
import { CanToolbar } from "./CanToolbar";
import { CanSummary } from "./CanSummary";
import { CanFrameList } from "./CanFrameList";

interface CanEmptyCopy {
  title: string;
  body: string;
}

const EMPTY_COPY: Record<Exclude<CanViewState, "rows">, CanEmptyCopy> = {
  off: { title: STRINGS.console.canOffTitle, body: STRINGS.console.canOffBody },
  unavailable: {
    title: STRINGS.console.canUnavailableTitle,
    body: STRINGS.console.canUnavailableBody,
  },
  listening: {
    title: STRINGS.console.canListeningTitle,
    body: STRINGS.console.canListeningBody,
  },
};

const CanBody = ({ view }: { view: CanMonitorView }) => {
  if (view.state === "rows") return <CanFrameList view={view} />;
  const copy = EMPTY_COPY[view.state];
  return (
    <EmptyCard
      icon={
        <Glyph
          name="frames"
          size={48}
          color={UiColors.textStale}
          strokeWidth={1.8}
        />
      }
      title={copy.title}
      body={copy.body}
    />
  );
};

export const CanTab = () => {
  const source = useCanFeed();
  const view = useCanMonitorView();
  useCanDashFilter(source, view.filter);
  return (
    <>
      <CanToolbar view={view} />
      <CanSummary view={view} />
      <CanBody view={view} />
    </>
  );
};
