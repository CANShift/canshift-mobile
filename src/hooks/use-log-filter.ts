import { useCallback, useMemo, useState } from "react";
import { useLogStore, type LogEntry } from "../stores/log.store";

export const useLogFilter = () => {
  const entries = useLogStore((s) => s.entries);
  const [pausedSnapshot, setPausedSnapshot] = useState<LogEntry[] | null>(null);
  const [filter, setFilter] = useState("");

  const paused = pausedSnapshot !== null;
  const source = pausedSnapshot ?? entries;

  const visible = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return source;
    return source.filter(
      (e) => e.message.toLowerCase().includes(query) || e.level.includes(query),
    );
  }, [source, filter]);

  const togglePause = useCallback(() => {
    setPausedSnapshot((current) => (current === null ? [...entries] : null));
  }, [entries]);

  return { visible, filter, setFilter, paused, togglePause };
};
