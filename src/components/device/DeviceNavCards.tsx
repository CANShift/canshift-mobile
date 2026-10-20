import { STRINGS } from "../../strings";
import { PAGES_STRINGS } from "../../pages-strings";
import { LinkRowCard } from "./LinkRowCard";

export interface DeviceNavCardsProps {
  onOpenConsole: () => void;
  onOpenPages?: () => void;
}

export const DeviceNavCards = ({
  onOpenConsole,
  onOpenPages,
}: DeviceNavCardsProps) => (
  <>
    {onOpenPages === undefined ? null : (
      <LinkRowCard label={PAGES_STRINGS.title} onPress={onOpenPages} />
    )}
    <LinkRowCard label={STRINGS.device.console} onPress={onOpenConsole} />
  </>
);
