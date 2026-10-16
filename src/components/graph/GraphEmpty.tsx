import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";
import { EmptyCard } from "../cards/EmptyCard";

export const GraphEmpty = () => (
  <EmptyCard
    icon={
      <Glyph
        name="chart"
        size={48}
        color={UiColors.textStale}
        strokeWidth={1.8}
      />
    }
    title={STRINGS.graph.emptyTitle}
    body={STRINGS.graph.emptyBody}
  />
);
