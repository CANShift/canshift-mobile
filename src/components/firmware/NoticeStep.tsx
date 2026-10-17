import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { BigButton } from "../buttons/BigButton";
import { FlowFrame } from "./FlowFrame";
import { FlowText } from "./FlowText";
import type { FlowStepProps } from "./FlowStepProps";

const F = STRINGS.firmware;

export type NoticeKind = "unreachable" | "busy";

interface NoticeCopy {
  title: string;
  body: string;
  offersSettings: boolean;
}

const NOTICES: Record<NoticeKind, NoticeCopy> = {
  unreachable: {
    title: F.unreachableTitle,
    body: F.unreachableBody,
    offersSettings: true,
  },
  busy: { title: F.busyTitle, body: F.busyBody, offersSettings: false },
};

export interface NoticeStepProps extends FlowStepProps {
  notice: NoticeKind;
}

export const NoticeStep = ({ model, notice }: NoticeStepProps) => {
  const copy = NOTICES[notice];
  return (
    <FlowFrame
      title={copy.title}
      footer={
        <>
          <BigButton
            label={F.tryAgain}
            tone="primary"
            height={TouchTarget.driving}
            onPress={model.retry}
          />
          {copy.offersSettings ? (
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
      }
    >
      <FlowText>{copy.body}</FlowText>
    </FlowFrame>
  );
};
