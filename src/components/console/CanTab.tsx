import { ConsoleEmpty } from "./ConsoleEmpty";

export const CanTab = () => (
  <ConsoleEmpty title="No CAN stream">
    Raw CAN frames aren&apos;t streamed to the companion app yet — the dashboard
    sends telemetry, status and timer channels over Bluetooth, not the raw bus.
  </ConsoleEmpty>
);
