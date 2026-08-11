import { useEffect, useState } from "react";

const TICK_MS = 1000;

const minuteText = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const useClockMinute = (): string => {
  const [text, setText] = useState(minuteText);
  useEffect(() => {
    const id = setInterval(() => {
      setText(minuteText());
    }, TICK_MS);
    return () => {
      clearInterval(id);
    };
  }, []);
  return text;
};
