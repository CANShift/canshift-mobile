import { ScrollView, StyleSheet, Text } from "react-native";
import { CIRCUIT_STRINGS } from "../../../circuit-strings";
import type { CircuitsModel } from "../../../hooks/use-circuits";
import { UiColors } from "../../../theme/ui-tokens";
import { BottomSheet } from "../../sheet/BottomSheet";
import { SheetDoneButton } from "../../sheet/SheetDoneButton";
import { CircuitRow } from "./CircuitRow";
import { CircuitNameDialog } from "./CircuitNameDialog";
import { DeleteCircuitDialog } from "./DeleteCircuitDialog";

const LIST_MAX_HEIGHT = 360;

export interface CircuitsSheetProps {
  model: CircuitsModel;
}

const CircuitList = ({ model }: CircuitsSheetProps) =>
  model.circuits.length === 0 ? (
    <Text style={styles.empty}>{CIRCUIT_STRINGS.empty}</Text>
  ) : (
    <ScrollView style={styles.list}>
      {model.circuits.map((circuit) => (
        <CircuitRow
          key={circuit.id}
          circuit={circuit}
          onRename={model.startRename}
          onDelete={model.askDelete}
        />
      ))}
    </ScrollView>
  );

export const CircuitsSheet = ({ model }: CircuitsSheetProps) => (
  <BottomSheet
    visible={model.sheetOpen}
    title={CIRCUIT_STRINGS.sheetTitle}
    subtitle={CIRCUIT_STRINGS.sheetSubtitle}
    accessory={
      <SheetDoneButton
        label={CIRCUIT_STRINGS.done}
        onPress={model.closeSheet}
      />
    }
    onClose={model.closeSheet}
  >
    <CircuitList model={model} />
    <CircuitNameDialog editor={model} kind="rename" />
    <DeleteCircuitDialog model={model} />
  </BottomSheet>
);

const styles = StyleSheet.create({
  list: { maxHeight: LIST_MAX_HEIGHT },
  empty: { fontSize: 15, lineHeight: 21, color: UiColors.textMuted },
});
