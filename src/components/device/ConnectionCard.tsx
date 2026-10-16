import { Pressable, StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import type { Link } from "../../lib/link-model";
import { LINK_PRESENTATION } from "../../lib/link-presentation";
import {
  CONNECTION_ACTIONS,
  type ConnectionAction,
} from "../../lib/device-connection";
import { SurfaceCard } from "../cards/SurfaceCard";
import { LinkDot } from "../shell/LinkDot";

const BUTTON_HEIGHT = 52;

export interface ConnectionCardProps {
  link: Link;
  dashName: string;
  onDisconnect: () => void;
  onReconnect: () => void;
}

const ACTION_LABELS: Record<Exclude<ConnectionAction, "none">, string> = {
  disconnect: STRINGS.device.disconnect,
  reconnect: STRINGS.device.reconnect,
};

export const ConnectionCard = ({
  link,
  dashName,
  onDisconnect,
  onReconnect,
}: ConnectionCardProps) => {
  const look = LINK_PRESENTATION[link];
  const action = CONNECTION_ACTIONS[link];
  const handlers = { disconnect: onDisconnect, reconnect: onReconnect };
  return (
    <SurfaceCard>
      <View style={styles.row}>
        <View style={styles.copy}>
          <View style={styles.state}>
            <LinkDot color={look.dotColor} filled={look.dotFilled} size={10} />
            <Text style={styles.label}>{look.label}</Text>
          </View>
          <Text style={styles.sub}>
            {STRINGS.device.viaBluetooth(dashName)}
          </Text>
        </View>
        {action === "none" ? null : (
          <Pressable
            style={styles.button}
            onPress={handlers[action]}
            accessibilityRole="button"
            accessibilityLabel={ACTION_LABELS[action]}
          >
            <Text style={styles.buttonText}>{ACTION_LABELS[action]}</Text>
          </Pressable>
        )}
      </View>
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  copy: { flex: 1, gap: 4 },
  state: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 18, fontWeight: "700", color: UiColors.text },
  sub: { fontSize: 14, color: UiColors.textMuted },
  button: {
    height: BUTTON_HEIGHT,
    paddingHorizontal: 16,
    borderRadius: UiRadius.tile,
    borderWidth: 1,
    borderColor: UiColors.border,
    justifyContent: "center",
  },
  buttonText: { fontSize: 16, color: UiColors.text },
});
