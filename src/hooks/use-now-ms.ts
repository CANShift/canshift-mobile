import { useEffect, useState } from "react";

const SECOND_MS = 1000;

export const useNowMs = (running: boolean, intervalMs = SECOND_MS): number => {
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    setNowMs(Date.now());
    if (!running) return;
    const id = setInterval(() => {
      setNowMs(Date.now());
    }, intervalMs);
    return () => {
      clearInterval(id);
    };
  }, [running, intervalMs]);
  return nowMs;
};
