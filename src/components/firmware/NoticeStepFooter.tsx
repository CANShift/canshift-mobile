import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { BigButton } from "../buttons/BigButton";
import type { FlowStepProps } from "./FlowStepProps";

const F = STRINGS.firmware;

interface NoticeStepFooterProps extends FlowStepProps {
  offersSettings: boolean;
}

export const NoticeStepFooter = ({
  model,
  offersSettings,
}: NoticeStepFooterProps) => (
  <>
    <BigButton
      label={F.tryAgain}
      tone="primary"
      height={TouchTarget.driving}
      onPress={model.retry}
    />
    {offersSettings ? (
      <BigButton
        label={F.openSettings}
        tone="outline"
        height={TouchTarget.min}
        onPress={model.openSettings}
      />
    ) : null}
    <BigButton
      label={F.close}
      tone="outline"
      height={TouchTarget.min}
      onPress={model.close}
    />
  </>
);
