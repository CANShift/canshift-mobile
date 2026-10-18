import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { ActionButton } from "../buttons/ActionButton";
import { Glyph } from "../icons/Glyph";
import { GRAPH_ACTION_ICON } from "./graph-action-icon";

interface GraphPauseButtonProps {
  hasData: boolean;
  userPaused: boolean;
  onPress: () => void;
}

export const GraphPauseButton = ({
  hasData,
  userPaused,
  onPress,
}: GraphPauseButtonProps) => (
  <ActionButton
    label={userPaused ? STRINGS.graph.resume : STRINGS.graph.pause}
    tone="filled"
    height={TouchTarget.driving}
    onPress={onPress}
    disabled={!hasData}
    icon={(color) => (
      <Glyph
        name={userPaused ? "play" : "pause"}
        size={GRAPH_ACTION_ICON}
        color={color}
      />
    )}
  />
);
