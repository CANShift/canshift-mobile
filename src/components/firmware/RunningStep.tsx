import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors, UiFonts } from "../../theme/ui-tokens";
import { stepRows, uploadPercent } from "../../lib/firmware-steps";
import { BigButton } from "../buttons/BigButton";
import { FlowFrame } from "./FlowFrame";
import { FlowText } from "./FlowText";
import { StepList } from "./StepList";
import type { FlowStepProps } from "./FlowStepProps";

const F = STRINGS.firmware;

const CancelUpload = ({ model }: FlowStepProps) => (
  <>
    <BigButton
      label={F.cancelUpload}
      tone="outline"
      height={TouchTarget.driving}
      onPress={model.cancelUpload}
    />
    <FlowText tone="muted">{F.cancelHint}</FlowText>
  </>
);

export const RunningStep = ({ model }: FlowStepProps) => {
  const { view } = model;
  if (view.kind !== "running") return null;
  const percent = uploadPercent(view.sent, view.total);
  return (
    <FlowFrame
      title={F.updatingTo(model.targetVersion)}
      footer={view.step === "upload" ? <CancelUpload model={model} /> : null}
    >
      <View style={styles.progress} accessibilityLiveRegion="polite">
        <Text style={styles.percent}>{F.percent(percent)}</Text>
        <Text style={styles.bytes}>{F.progress(view.sent, view.total)}</Text>
      </View>
      <StepList rows={stepRows(view.step)} />
      <FlowText tone="warning">{F.keepPower}</FlowText>
      <FlowText tone="muted">{F.keepOpen}</FlowText>
    </FlowFrame>
  );
};

const styles = StyleSheet.create({
  progress: { gap: 4 },
  percent: {
    fontSize: 44,
    fontWeight: "700",
    fontFamily: UiFonts.numeric,
    color: UiColors.text,
  },
  bytes: { fontSize: 15, color: UiColors.textMuted },
});
