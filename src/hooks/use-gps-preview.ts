import { useEffect } from "react";
import { gpsPreview } from "../services/gps-preview";

export const useGpsPreview = (active: boolean): void => {
  useEffect(() => {
    if (!active) return;
    void gpsPreview.start();
    return () => {
      gpsPreview.stop();
    };
  }, [active]);
};
