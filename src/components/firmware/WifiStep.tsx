import { STRINGS } from "../../strings";
import { TouchTarget } from "../../theme/ui-tokens";
import { BigButton } from "../buttons/BigButton";
import { FlowFrame } from "./FlowFrame";
import { FlowText } from "./FlowText";
import { NetworkFields } from "./NetworkFields";
import type { FlowStepProps } from "./FlowStepProps";
import type { WifiProblem } from "../../services/workshop/firmware-flow-types";

const F = STRINGS.firmware;

const PROBLEMS: Record<WifiProblem, string> = {
  denied: F.joinDenied,
  invalid: F.joinInvalid,
  failed: F.joinFailed,
};

const JoinFromApp = ({ model }: FlowStepProps) => {
  const { view, network } = model;
  const joining = view.kind === "wifi" && view.joining;
  const problem = view.kind === "wifi" ? view.problem : null;
  return (
    <>
      <FlowText>{F.wifiBody}</FlowText>
      <NetworkFields network={network} onChange={model.setNetwork} />
      {problem === null ? null : (
        <FlowText tone="warning">{PROBLEMS[problem]}</FlowText>
      )}
      <BigButton
        label={joining ? F.joining : F.join}
        tone="primary"
        height={TouchTarget.driving}
        disabled={joining || network.ssid === "" || network.password === ""}
        onPress={model.join}
      />
      <FlowText tone="muted">{F.wifiQrHint}</FlowText>
    </>
  );
};

const JoinInSettings = ({ model }: FlowStepProps) => (
  <>
    <FlowText>{F.wifiManualBody}</FlowText>
    <BigButton
      label={F.openSettings}
      tone="outline"
      height={TouchTarget.driving}
      onPress={model.openSettings}
    />
  </>
);

export const WifiStep = ({ model }: FlowStepProps) => (
  <FlowFrame
    title={F.wifiTitle}
    footer={
      <>
        <BigButton
          label={F.onDashWifi}
          tone="outline"
          height={TouchTarget.driving}
          onPress={model.connect}
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
    {model.canJoinFromApp ? (
      <JoinFromApp model={model} />
    ) : (
      <JoinInSettings model={model} />
    )}
  </FlowFrame>
);
