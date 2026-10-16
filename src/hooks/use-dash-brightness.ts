import { useCallback, useEffect, useState } from "react";
import { pushSettings, readSettings } from "../services/ble.service";
import { reportDashFailure } from "../lib/report-dash-failure";

export const BRIGHTNESS_RANGE = { min: 10, max: 100, step: 5 } as const;

export interface DashBrightness {
  brightness: number | null;
  setBrightness: (brightness: number) => void;
  commitBrightness: (brightness: number) => Promise<void>;
}

const loadBrightness = async (
  apply: (brightness: number | null) => void,
): Promise<void> => {
  try {
    const settings = await readSettings();
    apply(settings?.brightness ?? null);
  } catch (err) {
    reportDashFailure("Reading the dash brightness", err);
  }
};

const sendBrightness = async (brightness: number): Promise<void> => {
  try {
    await pushSettings({ brightness: Math.round(brightness) });
  } catch (err) {
    reportDashFailure("Setting the dash brightness", err);
  }
};

export const useDashBrightness = (enabled: boolean): DashBrightness => {
  const [brightness, setBrightness] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    void loadBrightness(setBrightness);
  }, [enabled]);
  const commitBrightness = useCallback(async (value: number) => {
    setBrightness(value);
    await sendBrightness(value);
  }, []);
  return { brightness, setBrightness, commitBrightness };
};
