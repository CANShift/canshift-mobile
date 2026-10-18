import { StyleSheet, View } from "react-native";
import { UiColors } from "../theme/ui-tokens";
import { useGraphScreen } from "../hooks/use-graph-screen";
import { GraphHeader } from "../components/graph/GraphHeader";
import { SignalChips } from "../components/graph/SignalChips";
import { GraphPlot } from "../components/graph/GraphPlot";
import { GraphModelActions } from "../components/graph/GraphModelActions";
import { SignalPicker } from "../components/graph/SignalPicker";
import { GraphDialogs } from "../components/graph/GraphDialogs";

const GraphScreen = () => {
  const graph = useGraphScreen();
  return (
    <View style={styles.screen}>
      <GraphHeader
        window={graph.window}
        paused={graph.pause.paused}
        onWindow={graph.setWindow}
      />
      <SignalChips
        signals={graph.selection.signals}
        latest={graph.latest}
        onRemove={graph.selection.toggle}
        onAdd={graph.selection.openPicker}
      />
      <GraphPlot graph={graph} />
      <GraphModelActions graph={graph} />
      <SignalPicker selection={graph.selection} latest={graph.latest} />
      <GraphDialogs graph={graph} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
    backgroundColor: UiColors.bg,
  },
});

export default GraphScreen;
