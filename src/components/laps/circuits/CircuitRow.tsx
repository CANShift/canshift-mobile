import { StyleSheet, Text, View } from "react-native";
import { CIRCUIT_STRINGS } from "../../../circuit-strings";
import type { SavedCircuit } from "../../../services/circuit-storage";
import { TouchTarget, UiColors } from "../../../theme/ui-tokens";
import { ToolButton } from "../../buttons/ToolButton";

export interface CircuitRowProps {
  circuit: SavedCircuit;
  onRename: (circuit: SavedCircuit) => void;
  onDelete: (circuit: SavedCircuit) => void;
}

export const CircuitRow = ({
  circuit,
  onRename,
  onDelete,
}: CircuitRowProps) => (
  <View style={styles.row}>
    <Text style={styles.name} numberOfLines={1}>
      {circuit.name}
    </Text>
    <ToolButton
      label={CIRCUIT_STRINGS.rename}
      onPress={() => {
        onRename(circuit);
      }}
    />
    <ToolButton
      label={CIRCUIT_STRINGS.delete}
      onPress={() => {
        onDelete(circuit);
      }}
    />
  </View>
);

const styles = StyleSheet.create({
  row: {
    minHeight: TouchTarget.driving,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: UiColors.borderRow,
  },
  name: { flex: 1, fontSize: 17, color: UiColors.text },
});
