import { Modal } from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import { useFirmwareFlow } from "../../hooks/use-firmware-flow";
import type { FlowView } from "../../services/workshop/firmware-flow-types";
import { PrepareStep } from "./PrepareStep";
import { WifiStep } from "./WifiStep";
import { WaitingStep } from "./WaitingStep";
import { NoticeStep } from "./NoticeStep";
import { ConfirmStep } from "./ConfirmStep";
import { RunningStep } from "./RunningStep";
import { SuccessStep } from "./SuccessStep";
import { FailedStep } from "./FailedStep";
import type { FlowStepProps } from "./FlowStepProps";

const KEEP_AWAKE_TAG = "canshift-firmware-update";

const STEPS: Record<
  FlowView["kind"],
  (props: FlowStepProps) => React.JSX.Element | null
> = {
  closed: () => null,
  prepare: PrepareStep,
  wifi: WifiStep,
  connecting: WaitingStep,
  unreachable: ({ model }) => <NoticeStep model={model} notice="unreachable" />,
  busy: ({ model }) => <NoticeStep model={model} notice="busy" />,
  ready: ConfirmStep,
  running: RunningStep,
  success: SuccessStep,
  failed: FailedStep,
};

export const FirmwareTakeover = () => {
  useKeepAwake(KEEP_AWAKE_TAG);
  const model = useFirmwareFlow();
  const Step = STEPS[model.view.kind];
  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      supportedOrientations={["portrait", "landscape"]}
      onRequestClose={() => undefined}
    >
      <Step model={model} />
    </Modal>
  );
};
