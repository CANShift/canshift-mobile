import { useState } from "react";
import { useLogStore } from "../../stores/log.store";
import { useLogFilter } from "../../hooks/use-log-filter";
import { LevelChips } from "./LevelChips";
import { LogToolbar } from "./LogToolbar";
import { LogList } from "./LogList";
import { ClearLogDialog } from "./ClearLogDialog";

export const LogTab = () => {
  const clear = useLogStore((s) => s.clear);
  const log = useLogFilter();
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <LogToolbar
        log={log}
        onClear={() => {
          setConfirming(true);
        }}
      />
      <LevelChips level={log.level} onLevel={log.setLevel} />
      <LogList log={log} />
      <ClearLogDialog
        visible={confirming}
        onConfirm={() => {
          clear();
          setConfirming(false);
        }}
        onCancel={() => {
          setConfirming(false);
        }}
      />
    </>
  );
};
