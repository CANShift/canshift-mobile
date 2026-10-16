import { useEffect, useState } from "react";
import { getFrameCount } from "../stores/signals.store";

const SAMPLE_MS = 1000;

export const useUpdateRate = (): number => {
  const [rate, setRate] = useState(0);
  useEffect(() => {
    let last = getFrameCount();
    const id = setInterval(() => {
      const count = getFrameCount();
      setRate(count - last);
      last = count;
    }, SAMPLE_MS);
    return () => {
      clearInterval(id);
    };
  }, []);
  return rate;
};
