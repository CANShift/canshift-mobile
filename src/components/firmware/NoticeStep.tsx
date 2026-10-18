import { STRINGS } from "../../strings";
import { FlowFrame } from "./FlowFrame";
import { FlowText } from "./FlowText";
import { NoticeStepFooter } from "./NoticeStepFooter";
import type { FlowStepProps } from "./FlowStepProps";

const F = STRINGS.firmware;

type NoticeKind = "unreachable" | "busy";

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
        <NoticeStepFooter model={model} offersSettings={copy.offersSettings} />
      }
    >
      <FlowText>{copy.body}</FlowText>
    </FlowFrame>
  );
};
