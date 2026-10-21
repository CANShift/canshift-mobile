import { shareTextFile } from "./share-file";
import { type SignalKey } from "../constants/ble";
import type { TelemetrySample } from "../stores/telemetry.store";

const EXPORT_FILE_NAME = "canshift-graph.csv";

export const buildGraphCsv = (
  samples: readonly TelemetrySample[],
  signals: readonly SignalKey[],
): string => {
  const header = ["t_ms", ...signals].join(",");
  const rows = samples.map((sample) =>
    [
      String(sample.t),
      ...signals.map((key) => {
        const value = sample.v[key];
        return value === undefined ? "" : String(value);
      }),
    ].join(","),
  );
  return [header, ...rows].join("\n");
};

export const exportGraphCsv = async (
  samples: readonly TelemetrySample[],
  signals: readonly SignalKey[],
): Promise<void> => {
  await shareTextFile(
    EXPORT_FILE_NAME,
    buildGraphCsv(samples, signals),
    "CANShift graph export",
  );
};
