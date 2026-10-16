import { Pressable, StyleSheet, Text } from "react-native";
import { SHELL_TAB_LABELS, tabLook, type ShellTab } from "../../lib/shell-tabs";
import { TabIcon } from "./TabIcon";

const LABEL_SIZE = 13;

export interface TabButtonProps {
  tab: ShellTab;
  focused: boolean;
  iconSize: number;
  onPress: () => void;
}

export const TabButton = ({
  tab,
  focused,
  iconSize,
  onPress,
}: TabButtonProps) => {
  const look = tabLook(focused);
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={SHELL_TAB_LABELS[tab]}
    >
      <TabIcon tab={tab} color={look.iconColor} size={iconSize} />
      <Text
        style={[
          styles.label,
          { color: look.textColor, fontWeight: look.fontWeight },
        ]}
      >
        {SHELL_TAB_LABELS[tab]}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: { fontSize: LABEL_SIZE },
});
