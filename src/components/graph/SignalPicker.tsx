import { ScrollView, StyleSheet } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import type { SignalValues } from "../../stores/telemetry.store";
import type { GraphSelection } from "../../hooks/use-graph-selection";
import { BottomSheet } from "../sheet/BottomSheet";
import { SheetDoneButton } from "../sheet/SheetDoneButton";
import { SignalPickerRow } from "./SignalPickerRow";
import { SearchField } from "../controls/SearchField";

const LIST_MAX_HEIGHT = 440;

export interface SignalPickerProps {
  selection: GraphSelection;
  latest: SignalValues;
}

export const SignalPicker = ({ selection, latest }: SignalPickerProps) => (
  <BottomSheet
    visible={selection.pickerOpen}
    title={STRINGS.graph.pickerTitle}
    subtitle={STRINGS.graph.pickerCount(selection.signals.length)}
    accessory={
      <SheetDoneButton
        label={STRINGS.graph.done}
        onPress={selection.closePicker}
      />
    }
    onClose={selection.closePicker}
  >
    <SearchField
      value={selection.query}
      onChange={selection.setQuery}
      placeholder={STRINGS.graph.searchSignals}
    />
    <ScrollView style={styles.list}>
      {selection.matches.map((key) => (
        <SignalPickerRow
          key={key}
          signal={key}
          selection={selection}
          latest={latest}
        />
      ))}
    </ScrollView>
  </BottomSheet>
);

const styles = StyleSheet.create({
  list: {
    maxHeight: LIST_MAX_HEIGHT,
    borderRadius: UiRadius.tile,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.bg,
  },
});
