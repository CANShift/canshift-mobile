import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import type { Link } from "../../lib/link-model";
import { LINK_PRESENTATION } from "../../lib/link-presentation";
import { LinkDot } from "../shell/LinkDot";

interface ConnectionStatusProps {
  link: Link;
  dashName: string;
}

export const ConnectionStatus = ({ link, dashName }: ConnectionStatusProps) => {
  const look = LINK_PRESENTATION[link];
  return (
    <View style={styles.copy}>
      <View style={styles.state}>
        <LinkDot color={look.dotColor} filled={look.dotFilled} size={10} />
        <Text style={styles.label}>{look.label}</Text>
      </View>
      <Text style={styles.sub}>{STRINGS.device.viaBluetooth(dashName)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  copy: { flex: 1, gap: 4 },
  state: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 18, fontWeight: "700", color: UiColors.text },
  sub: { fontSize: 14, color: UiColors.textMuted },
});
