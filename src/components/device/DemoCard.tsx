import { StyleSheet, Text } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";
import { SurfaceCard } from "../cards/SurfaceCard";
import { BigButton } from "../buttons/BigButton";

export interface DemoCardProps {
  onEnd: () => void;
}

export const DemoCard = ({ onEnd }: DemoCardProps) => (
  <SurfaceCard tone="warning">
    <Text style={styles.title}>{STRINGS.device.demoTitle}</Text>
    <Text style={styles.body}>{STRINGS.device.demoBody}</Text>
    <BigButton
      label={STRINGS.device.endDemo}
      tone="outline"
      height={TouchTarget.driving}
      onPress={onEnd}
    />
  </SurfaceCard>
);

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "700", color: UiColors.warningTextStrong },
  body: { fontSize: 15, lineHeight: 21, color: UiColors.warningText },
});
