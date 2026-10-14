import { useEffect, useState } from "react";

export const DISPLAY_TICK_MS = 50;

export const useTickingMs = (
  readMs: () => number,
  running: boolean,
): number => {
  const [ms, setMs] = useState(readMs);

  useEffect(() => {
    const sync = () => {
      setMs(readMs());
    };
    sync();
    if (!running) return;
    const id = setInterval(sync, DISPLAY_TICK_MS);
    return () => {
      clearInterval(id);
    };
  }, [readMs, running]);

  return ms;
};
