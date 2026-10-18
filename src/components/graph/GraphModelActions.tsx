import type { GraphScreenModel } from "../../hooks/use-graph-screen";
import { GraphActions } from "./GraphActions";

interface GraphModelActionsProps {
  graph: GraphScreenModel;
}

export const GraphModelActions = ({ graph }: GraphModelActionsProps) => (
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
);
