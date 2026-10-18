import { Switch } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { useAppSettingsStore } from "../../stores/app-settings.store";

export const AutoReconnectSwitch = () => {
  const reconnect = useAppSettingsStore((s) => s.reconnectBehavior);
  const setReconnect = useAppSettingsStore((s) => s.setReconnectBehavior);
  return (
    <Switch
      value={reconnect === "auto"}
      onValueChange={(on) => {
        setReconnect(on ? "auto" : "off");
      }}
      trackColor={{ true: UiColors.success, false: UiColors.surface2 }}
      accessibilityLabel={STRINGS.device.autoReconnect}
    />
  );
};
