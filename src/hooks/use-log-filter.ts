import { useCallback, useMemo, useState } from "react";
import { useLogStore, type LogEntry, type LogLevel } from "../stores/log.store";

export type LevelFilter = "all" | LogLevel;

export interface LogFilter {
  visible: readonly LogEntry[];
  filter: string;
  setFilter: (filter: string) => void;
  level: LevelFilter;
  setLevel: (level: LevelFilter) => void;
  paused: boolean;
  togglePause: () => void;
}

const matches = (entry: LogEntry, query: string, level: LevelFilter): boolean =>
  (level === "all" || entry.level === level) &&
  (query.length === 0 || entry.message.toLowerCase().includes(query));

export const useLogFilter = (): LogFilter => {
  const entries = useLogStore((s) => s.entries);
  const [pausedSnapshot, setPausedSnapshot] = useState<LogEntry[] | null>(null);
  const [filter, setFilter] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const source = pausedSnapshot ?? entries;

  const visible = useMemo(() => {
    const query = filter.trim().toLowerCase();
    return source.filter((entry) => matches(entry, query, level));
  }, [source, filter, level]);

  const togglePause = useCallback(() => {
    setPausedSnapshot((current) => (current === null ? [...entries] : null));
  }, [entries]);

  return {
    visible,
    filter,
    setFilter,
    level,
    setLevel,
    paused: pausedSnapshot !== null,
    togglePause,
  };
};
