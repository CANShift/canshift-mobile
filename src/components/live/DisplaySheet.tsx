import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { BottomSheet } from "../sheet/BottomSheet";
import { PrimaryButton } from "../buttons/PrimaryButton";
import { BrightnessRow } from "./BrightnessRow";
import { KeepScreenOnRow } from "./KeepScreenOnRow";

export interface DisplaySheetProps {
  visible: boolean;
  dashConnected: boolean;
  onClose: () => void;
}

export const DisplaySheet = ({
  visible,
  dashConnected,
  onClose,
}: DisplaySheetProps) => (
  <BottomSheet visible={visible} title={STRINGS.live.display} onClose={onClose}>
    <BrightnessRow enabled={visible && dashConnected} />
    <KeepScreenOnRow />
    <PrimaryButton
      label={STRINGS.live.done}
      onPress={onClose}
      height={TouchTarget.driving}
    />
  </BottomSheet>
);
