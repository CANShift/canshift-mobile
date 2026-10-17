import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { BigButton } from "../buttons/BigButton";
import { FlowFrame } from "./FlowFrame";
import { FlowText } from "./FlowText";
import type { FlowStepProps } from "./FlowStepProps";

const F = STRINGS.firmware;

export const ConfirmStep = ({ model }: FlowStepProps) => (
  <FlowFrame
    title={F.confirmTitle(model.targetVersion)}
    footer={
      <>
        <BigButton
          label={F.confirmInstall}
          tone="primary"
          height={TouchTarget.driving}
          onPress={model.install}
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
    <FlowText>{F.confirmRuns(model.runningVersion)}</FlowText>
    <FlowText>{F.confirmBody}</FlowText>
    <FlowText tone="muted">{F.leaveHint}</FlowText>
  </FlowFrame>
);
