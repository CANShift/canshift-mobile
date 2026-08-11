import { useEffect, useState } from "react";

const TICK_MS = 1000;

export const useSecondsSince = (marker: string | null): number => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    setSeconds(0);
    if (marker === null) return;
    const start = Date.now();
    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / TICK_MS));
    }, TICK_MS);
    return () => {
      clearInterval(id);
    };
  }, [marker]);
  return seconds;
};
