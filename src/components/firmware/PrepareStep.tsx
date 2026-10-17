import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { BigButton } from "../buttons/BigButton";
import { FlowFrame } from "./FlowFrame";
import { FlowText } from "./FlowText";
import type { FlowStepProps } from "./FlowStepProps";

const F = STRINGS.firmware;

export const PrepareStep = ({ model }: FlowStepProps) => (
  <FlowFrame
    title={F.prepareTitle}
    footer={
      <>
        <BigButton
          label={F.prepareNext}
          tone="primary"
          height={TouchTarget.driving}
          onPress={model.inWorkshop}
        />
        <BigButton
          label={F.cancel}
          tone="outline"
          height={TouchTarget.min}
          onPress={model.close}
        />
      </>
    }
  >
    <FlowText>{F.prepareBody}</FlowText>
    <FlowText tone="muted">{F.prepareNote}</FlowText>
  </FlowFrame>
);
