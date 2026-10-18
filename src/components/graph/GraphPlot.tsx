import type { GraphScreenModel } from "../../hooks/use-graph-screen";
import { GraphChart } from "./GraphChart";
import { GraphEmpty } from "./GraphEmpty";

interface GraphPlotProps {
  graph: GraphScreenModel;
}

export const GraphPlot = ({ graph }: GraphPlotProps) =>
  graph.series.hasData ? (
    <GraphChart
      series={graph.series}
      signals={graph.selection.signals}
      window={graph.window}
    />
  ) : (
    <GraphEmpty />
  );
