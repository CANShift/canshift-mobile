import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { BigButton } from "../buttons/BigButton";

const F = STRINGS.firmware;

interface FailedStepFooterProps {
  canRetry: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export const FailedStepFooter = ({
  canRetry,
  onRetry,
  onClose,
}: FailedStepFooterProps) => (
  <>
    {canRetry ? (
      <BigButton
        label={F.tryAgain}
        tone="primary"
        height={TouchTarget.driving}
        onPress={onRetry}
      />
    ) : null}
    <BigButton
      label={F.close}
      tone="outline"
      height={TouchTarget.driving}
      onPress={onClose}
    />
  </>
);
