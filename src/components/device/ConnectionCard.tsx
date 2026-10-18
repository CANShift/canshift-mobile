import { StyleSheet, View } from "react-native";
import { STRINGS } from "../../strings";
import type { Link } from "../../lib/link-model";
import {
  CONNECTION_ACTIONS,
  type ConnectionAction,
} from "../../lib/device-connection";
import { SurfaceCard } from "../cards/SurfaceCard";
import { ConnectionStatus } from "./ConnectionStatus";
import { ConnectionActionButton } from "./ConnectionActionButton";

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
  const action = CONNECTION_ACTIONS[link];
  const handlers = { disconnect: onDisconnect, reconnect: onReconnect };
  return (
    <SurfaceCard>
      <View style={styles.row}>
        <ConnectionStatus link={link} dashName={dashName} />
        {action === "none" ? null : (
          <ConnectionActionButton
            label={ACTION_LABELS[action]}
            onPress={handlers[action]}
          />
        )}
      </View>
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
});
