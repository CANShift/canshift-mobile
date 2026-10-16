import { StyleSheet, View } from "react-native";
import { STRINGS } from "../strings";
import { UiColors } from "../theme/ui-tokens";
import { GRAPH_WINDOW_LABELS } from "../lib/graph-config";
import { useGraphScreen } from "../hooks/use-graph-screen";
import { GraphHeader } from "../components/graph/GraphHeader";
import { SignalChips } from "../components/graph/SignalChips";
import { GraphChart } from "../components/graph/GraphChart";
import { GraphEmpty } from "../components/graph/GraphEmpty";
import { GraphActions } from "../components/graph/GraphActions";
import { SignalPicker } from "../components/graph/SignalPicker";
import { ConfirmDialog } from "../components/dialog/ConfirmDialog";

const GraphScreen = () => {
  const graph = useGraphScreen();
  const closeDialog = () => {
    graph.openDialog("none");
  };
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
      {graph.series.hasData ? (
        <GraphChart
          series={graph.series}
          signals={graph.selection.signals}
          window={graph.window}
        />
      ) : (
        <GraphEmpty />
      )}
      <GraphActions
        hasData={graph.series.hasData}
        userPaused={graph.pause.userPaused}
        onTogglePause={graph.pause.togglePause}
        onClear={() => {
          graph.openDialog("clear");
        }}
        onExport={() => {
          graph.openDialog("export");
        }}
      />
      <SignalPicker selection={graph.selection} latest={graph.latest} />
      <ConfirmDialog
        visible={graph.dialog === "clear"}
        title={STRINGS.graph.clearTitle}
        body={STRINGS.graph.clearBody}
        confirmLabel={STRINGS.graph.clear}
        cancelLabel={STRINGS.graph.cancel}
        onConfirm={graph.confirmClear}
        onCancel={closeDialog}
      />
      <ConfirmDialog
        visible={graph.dialog === "export"}
        title={STRINGS.graph.exportTitle}
        body={STRINGS.graph.exportBody(GRAPH_WINDOW_LABELS[graph.window])}
        confirmLabel={STRINGS.graph.share}
        cancelLabel={STRINGS.graph.cancel}
        onConfirm={() => void graph.confirmExport()}
        onCancel={closeDialog}
      />
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
