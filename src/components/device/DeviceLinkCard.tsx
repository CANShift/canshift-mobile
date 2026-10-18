import type { DeviceScreenModel } from "../../hooks/use-device-screen";
import { retryReconnect } from "../../services/session-exit";
import { ConnectionCard } from "./ConnectionCard";
import { DemoCard } from "./DemoCard";

interface DeviceLinkCardProps {
  device: DeviceScreenModel;
}

export const DeviceLinkCard = ({ device }: DeviceLinkCardProps) =>
  device.link === "demo" ? (
    <DemoCard
      onEnd={() => {
        device.setDialog("endDemo");
      }}
    />
  ) : (
    <ConnectionCard
      link={device.link}
      dashName={device.dashName}
      onDisconnect={() => {
        device.setDialog("disconnect");
      }}
      onReconnect={() => void retryReconnect()}
    />
  );
