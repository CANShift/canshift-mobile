import { Share } from "react-native";
import { File, Paths } from "expo-file-system";
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
  const file = new File(Paths.cache, EXPORT_FILE_NAME);
  file.write(buildGraphCsv(samples, signals));
  await Share.share({ url: file.uri, title: "CANShift graph export" });
};
