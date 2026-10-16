import { useState } from "react";
import type { SignalKey } from "../constants/ble";
import {
  DEFAULT_GRAPH_SIGNALS,
  matchingSignals,
  toggleSignal,
} from "../lib/graph-config";

export interface GraphSelection {
  signals: readonly SignalKey[];
  toggle: (key: SignalKey) => void;
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  query: string;
  setQuery: (query: string) => void;
  matches: readonly SignalKey[];
}

export const useGraphSelection = (): GraphSelection => {
  const [signals, setSignals] = useState<readonly SignalKey[]>(
    DEFAULT_GRAPH_SIGNALS,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  return {
    signals,
    toggle: (key) => {
      setSignals((current) => toggleSignal(current, key));
    },
    pickerOpen,
    openPicker: () => {
      setPickerOpen(true);
    },
    closePicker: () => {
      setPickerOpen(false);
      setQuery("");
    },
    query,
    setQuery,
    matches: matchingSignals(query),
  };
};
