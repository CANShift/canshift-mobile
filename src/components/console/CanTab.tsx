import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";
import { EmptyCard } from "../cards/EmptyCard";

export const CanTab = () => (
  <EmptyCard
    icon={
      <Glyph
        name="frames"
        size={48}
        color={UiColors.textStale}
        strokeWidth={1.8}
      />
    }
    title={STRINGS.console.canEmptyTitle}
    body={STRINGS.console.canEmptyBody}
  />
);
