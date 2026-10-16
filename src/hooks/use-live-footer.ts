import { useSignalsStore } from "../stores/signals.store";
import { ageSeconds } from "../lib/signal-staleness";
import { FOOTER_LOOKS, footerState, type FooterLook } from "../lib/live-footer";
import { useLink } from "./use-link";
import { useNowMs } from "./use-now-ms";
import { useUpdateRate } from "./use-update-rate";

export interface LiveFooterModel {
  look: FooterLook;
  text: string;
}

export const useLiveFooter = (): LiveFooterModel => {
  const link = useLink();
  const noData = useSignalsStore((s) => !s.isLive && s.staleSinceMs > 0);
  const lastUpdateMs = useSignalsStore((s) => s.lastUpdateMs);
  const rate = useUpdateRate();
  const nowMs = useNowMs(noData);
  const inputs = {
    link,
    noData,
    rate,
    secondsSinceData: ageSeconds(lastUpdateMs, nowMs),
  };
  const look = FOOTER_LOOKS[footerState(inputs)];
  return { look, text: look.text(inputs) };
};
