import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAlertsStore } from "../stores/alerts.store";
import { useSignalsStore } from "../stores/signals.store";
import { alertViews, type AlertViews } from "../lib/alert-views";
import { SIGNAL_META, type SignalKey } from "../constants/ble";
import { formatWidgetValue } from "../components/widgets/widget-value";
import { NO_VALUE } from "../lib/tile-state";
import { STRINGS } from "../strings";

export const useAlertViews = (): AlertViews => {
  const inputs = useAlertsStore(
    useShallow((s) => ({
      active: s.active,
      acknowledged: s.acknowledged,
      muted: s.muted,
    })),
  );
  return useMemo(() => alertViews(inputs), [inputs]);
};

export const useAlertFromDash = (): boolean =>
  useAlertsStore((s) => s.feed === "dash");

export interface AlertContextRow {
  label: string;
  value: string;
}

const readingText = (key: SignalKey, value: number | undefined): string => {
  if (value === undefined) return NO_VALUE;
  const { unit, decimals } = SIGNAL_META[key];
  const text = formatWidgetValue(value, decimals);
  return unit === "" ? text : `${text} ${unit}`;
};

export const useAlertContext = (): readonly AlertContextRow[] => {
  const rpm = useSignalsStore((s) => s.values.r);
  const oilTemp = useSignalsStore((s) => s.values.ot);
  return [
    { label: STRINGS.alert.rpm, value: readingText("r", rpm) },
    { label: STRINGS.alert.oilTemp, value: readingText("ot", oilTemp) },
  ];
};
