import { failureCopy } from "../../lib/firmware-failure-copy";
import { FlowFrame } from "./FlowFrame";
import { FlowText } from "./FlowText";
import { FailedStepFooter } from "./FailedStepFooter";
import type { FlowStepProps } from "./FlowStepProps";

export const FailedStep = ({ model }: FlowStepProps) => {
  const { view } = model;
  if (view.kind !== "failed") return null;
  const copy = failureCopy(view.failure, model.runningVersion);
  return (
    <FlowFrame
      title={copy.title}
      footer={
        <FailedStepFooter
          canRetry={copy.canRetry}
          onRetry={model.retry}
          onClose={model.close}
        />
      }
    >
      <FlowText>{copy.cause}</FlowText>
      <FlowText tone="muted">{copy.advice}</FlowText>
    </FlowFrame>
  );
};
