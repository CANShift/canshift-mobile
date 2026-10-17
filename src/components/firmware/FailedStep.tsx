import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { failureCopy } from "../../lib/firmware-failure-copy";
import { BigButton } from "../buttons/BigButton";
import { FlowFrame } from "./FlowFrame";
import { FlowText } from "./FlowText";
import type { FlowStepProps } from "./FlowStepProps";

const F = STRINGS.firmware;

export const FailedStep = ({ model }: FlowStepProps) => {
  const { view } = model;
  if (view.kind !== "failed") return null;
  const copy = failureCopy(view.failure, model.runningVersion);
  return (
    <FlowFrame
      title={copy.title}
      footer={
        <>
          {copy.canRetry ? (
            <BigButton
              label={F.tryAgain}
              tone="primary"
              height={TouchTarget.driving}
              onPress={model.retry}
            />
          ) : null}
          <BigButton
            label={F.close}
            tone="outline"
            height={TouchTarget.driving}
            onPress={model.close}
          />
        </>
      }
    >
      <FlowText>{copy.cause}</FlowText>
      <FlowText tone="muted">{copy.advice}</FlowText>
    </FlowFrame>
  );
};
