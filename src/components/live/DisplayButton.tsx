import Svg, { Circle, Path } from "react-native-svg";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { ToolButton } from "../buttons/ToolButton";

const ICON_SIZE = 18;

const SunIcon = () => (
  <Svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 24 24"
    fill="none"
    stroke={UiColors.text}
    strokeWidth={2}
    strokeLinecap="round"
  >
    <Circle cx="12" cy="12" r="4" />
    <Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);

export interface DisplayButtonProps {
  onPress: () => void;
}

export const DisplayButton = ({ onPress }: DisplayButtonProps) => (
  <ToolButton
    label={STRINGS.live.display}
    onPress={onPress}
    icon={<SunIcon />}
  />
);
