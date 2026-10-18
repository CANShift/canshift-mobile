import { StyleSheet, Text } from "react-native";
import { UiColors } from "../../theme/ui-tokens";

type FlowTextTone = "body" | "muted" | "warning";

export interface FlowTextProps {
  children: string;
  tone?: FlowTextTone;
}

const COLORS: Record<FlowTextTone, string> = {
  body: UiColors.textSecondary,
  muted: UiColors.textMuted,
  warning: UiColors.warningText,
};

export const FlowText = ({ children, tone = "body" }: FlowTextProps) => (
  <Text style={[styles.text, { color: COLORS[tone] }]}>{children}</Text>
);

const styles = StyleSheet.create({
  text: { fontSize: 16, lineHeight: 22 },
});
