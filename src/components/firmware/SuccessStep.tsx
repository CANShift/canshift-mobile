import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { BigButton } from "../buttons/BigButton";
import { FlowFrame } from "./FlowFrame";
import { FlowText } from "./FlowText";
import type { FlowStepProps } from "./FlowStepProps";

const F = STRINGS.firmware;

export const SuccessStep = ({ model }: FlowStepProps) => (
  <FlowFrame
    title={F.successTitle(
      model.view.kind === "success" ? model.view.version : model.targetVersion,
    )}
    footer={
      <BigButton
        label={F.done}
        tone="primary"
        height={TouchTarget.driving}
        onPress={model.close}
      />
    }
  >
    <FlowText>{F.successBody}</FlowText>
  </FlowFrame>
);
