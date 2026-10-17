import { ActivityIndicator, StyleSheet, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";
import { BigButton } from "../buttons/BigButton";
import { FlowFrame } from "./FlowFrame";
import type { FlowStepProps } from "./FlowStepProps";

const F = STRINGS.firmware;

export const WaitingStep = ({ model }: FlowStepProps) => (
  <FlowFrame
    title={F.connecting}
    footer={
      <BigButton
        label={F.cancel}
        tone="outline"
        height={TouchTarget.min}
        onPress={model.close}
      />
    }
  >
    <View style={styles.spinner} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={UiColors.textMuted} />
    </View>
  </FlowFrame>
);

const styles = StyleSheet.create({
  spinner: { paddingVertical: 32 },
});
