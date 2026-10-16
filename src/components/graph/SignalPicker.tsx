import { ScrollView, StyleSheet } from "react-native";
import { SIGNAL_META, type SignalKey } from "../../constants/ble";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import type { SignalValues } from "../../stores/telemetry.store";
import { formatNumber } from "../../lib/graph-math";
import { MAX_GRAPH_SIGNALS, seriesStyle } from "../../lib/graph-config";
import type { GraphSelection } from "../../hooks/use-graph-selection";
import { BottomSheet } from "../sheet/BottomSheet";
import { SheetDoneButton } from "../sheet/SheetDoneButton";
import { PickerRow } from "./PickerRow";
import { SignalSearch } from "./SignalSearch";

const LIST_MAX_HEIGHT = 440;

export interface SignalPickerProps {
  selection: GraphSelection;
  latest: SignalValues;
}

export const SignalPicker = ({ selection, latest }: SignalPickerProps) => {
  const full = selection.signals.length >= MAX_GRAPH_SIGNALS;
  const rowFor = (key: SignalKey) => {
    const index = selection.signals.indexOf(key);
    return (
      <PickerRow
        key={key}
        name={SIGNAL_META[key].label}
        value={formatNumber(key, latest[key])}
        checked={index >= 0}
        disabled={full && index < 0}
        swatch={index >= 0 ? seriesStyle(index).color : null}
        onPress={() => {
          selection.toggle(key);
        }}
      />
    );
  };
  return (
    <BottomSheet
      visible={selection.pickerOpen}
      title={STRINGS.graph.pickerTitle}
      subtitle={STRINGS.graph.pickerCount(
        selection.signals.length,
        MAX_GRAPH_SIGNALS,
      )}
      accessory={
        <SheetDoneButton
          label={STRINGS.graph.done}
          onPress={selection.closePicker}
        />
      }
      onClose={selection.closePicker}
    >
      <SignalSearch query={selection.query} onQuery={selection.setQuery} />
      <ScrollView style={styles.list}>
        {selection.matches.map(rowFor)}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  list: {
    maxHeight: LIST_MAX_HEIGHT,
    borderRadius: UiRadius.tile,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.bg,
  },
});
