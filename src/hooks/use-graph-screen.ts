import { useState } from "react";
import { clearBuffer, type SignalValues } from "../stores/telemetry.store";
import { exportGraphCsv } from "../services/graph-export";
import { reportFailure } from "../lib/report-dash-failure";
import { DEFAULT_GRAPH_WINDOW, type GraphWindow } from "../lib/graph-config";
import { STRINGS } from "../strings";
import { useGraphSeries, type GraphSeries } from "./use-graph-series";
import { useGraphPause, type GraphPause } from "./use-graph-pause";
import { useGraphSelection, type GraphSelection } from "./use-graph-selection";

export type GraphDialog = "none" | "clear" | "export";

export interface GraphScreenModel {
  window: GraphWindow;
  setWindow: (window: GraphWindow) => void;
  pause: GraphPause;
  selection: GraphSelection;
  series: GraphSeries;
  latest: SignalValues;
  dialog: GraphDialog;
  openDialog: (dialog: GraphDialog) => void;
  confirmClear: () => void;
  confirmExport: () => Promise<void>;
}

const exportWindow = async (
  series: GraphSeries,
  selection: GraphSelection,
): Promise<void> => {
  try {
    await exportGraphCsv(series.rolling, selection.signals);
  } catch (err) {
    reportFailure("Graph export", err, STRINGS.graph.exportFailed);
  }
};

export const useGraphScreen = (): GraphScreenModel => {
  const [window, setWindow] = useState<GraphWindow>(DEFAULT_GRAPH_WINDOW);
  const [dialog, setDialog] = useState<GraphDialog>("none");
  const pause = useGraphPause();
  const selection = useGraphSelection();
  const series = useGraphSeries(window, pause.paused, pause.pausedAt);
  return {
    window,
    setWindow,
    pause,
    selection,
    series,
    latest: series.rolling[series.rolling.length - 1]?.v ?? {},
    dialog,
    openDialog: setDialog,
    confirmClear: () => {
      clearBuffer();
      setDialog("none");
    },
    confirmExport: async () => {
      setDialog("none");
      await exportWindow(series, selection);
    },
  };
};
