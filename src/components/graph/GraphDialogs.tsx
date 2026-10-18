import { STRINGS } from "../../strings";
import { GRAPH_WINDOW_LABELS } from "../../lib/graph-config";
import type { GraphScreenModel } from "../../hooks/use-graph-screen";
import { ConfirmDialog } from "../dialog/ConfirmDialog";

interface GraphDialogsProps {
  graph: GraphScreenModel;
}

export const GraphDialogs = ({ graph }: GraphDialogsProps) => {
  const closeDialog = () => {
    graph.openDialog("none");
  };
  return (
    <>
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
    </>
  );
};
