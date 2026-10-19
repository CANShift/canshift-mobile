import { StyleSheet, Text } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";
import { useNotificationPermissionStore } from "../../stores/notification-permission.store";
import { openPhoneSettings } from "../../lib/device-actions";
import { BigButton } from "../buttons/BigButton";

export const NotificationsOffRow = () => {
  const off = useNotificationPermissionStore((s) => s.permission === "denied");
  if (!off) return null;
  return (
    <>
      <Text style={styles.line}>{STRINGS.notifications.off}</Text>
      <BigButton
        label={STRINGS.notifications.openSettings}
        tone="outline"
        height={TouchTarget.driving}
        onPress={() => void openPhoneSettings()}
      />
    </>
  );
};

const styles = StyleSheet.create({
  line: { fontSize: 15, lineHeight: 21, color: UiColors.textMuted },
});
