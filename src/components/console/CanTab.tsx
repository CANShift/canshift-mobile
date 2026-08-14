import { useCanFilterStore } from "../../stores/can-filter.store";
import {
  CLEAR_FILTER_LABEL,
  canEmptyMessage,
  canFilterLabel,
} from "../../lib/can-filter";
import { ConsoleEmpty, type ConsoleEmptyAction } from "./ConsoleEmpty";

export const CanTab = () => {
  const range = useCanFilterStore((s) => s.range);
  const clear = useCanFilterStore((s) => s.clear);

  const action: ConsoleEmptyAction | undefined =
    range === null ? undefined : { label: CLEAR_FILTER_LABEL, onPress: clear };

  return (
    <ConsoleEmpty action={action} footer={canFilterLabel(range)}>
      {canEmptyMessage(range)}
    </ConsoleEmpty>
  );
};
