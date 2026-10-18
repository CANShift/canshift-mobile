import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { ActionButton } from "../buttons/ActionButton";
import { Glyph } from "../icons/Glyph";
import { GRAPH_ACTION_ICON } from "./graph-action-icon";

interface GraphExportButtonProps {
  hasData: boolean;
  onPress: () => void;
}

export const GraphExportButton = ({
  hasData,
  onPress,
}: GraphExportButtonProps) => (
  <ActionButton
    label={STRINGS.graph.export}
    tone="outline"
    height={TouchTarget.driving}
    onPress={onPress}
    disabled={!hasData}
    icon={(color) => (
      <Glyph
        name="export"
        size={GRAPH_ACTION_ICON}
        color={color}
        strokeWidth={2}
      />
    )}
  />
);
