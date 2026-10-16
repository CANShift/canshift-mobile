import { StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { UiColors } from "../../theme/ui-tokens";
import { isShellTab } from "../../lib/shell-tabs";
import { LINK_PRESENTATION } from "../../lib/link-presentation";
import { useLink } from "../../hooks/use-link";
import { useIsLandscape } from "../../hooks/use-is-landscape";
import { TabButton } from "./TabButton";
import { LinkDot } from "./LinkDot";

const TAB_BAR_HEIGHT = 64;
const TAB_ICON = 28;
const RAIL_WIDTH = 96;
const RAIL_ICON = 30;
const RAIL_STATUS_HEIGHT = 30;
const RAIL_DOT = 10;
const RAIL_STATUS_SIZE = 11;

const TabButtons = ({
  state,
  navigation,
  iconSize,
}: BottomTabBarProps & { iconSize: number }) => (
  <>
    {state.routes.map((route, index) => {
      if (!isShellTab(route.name)) return null;
      const focused = state.index === index;
      const onPress = () => {
        const event = navigation.emit({
          type: "tabPress",
          target: route.key,
          canPreventDefault: true,
        });
        if (focused || event.defaultPrevented) return;
        navigation.navigate(route.name);
      };
      return (
        <TabButton
          key={route.key}
          tab={route.name}
          focused={focused}
          iconSize={iconSize}
          onPress={onPress}
        />
      );
    })}
  </>
);

const RailStatus = () => {
  const look = LINK_PRESENTATION[useLink()];
  return (
    <View style={styles.railStatus}>
      <LinkDot color={look.dotColor} filled={look.dotFilled} size={RAIL_DOT} />
      <Text style={styles.railStatusText}>{look.railLabel}</Text>
    </View>
  );
};

const BottomBar = (props: BottomTabBarProps) => (
  <View
    style={[styles.bar, { paddingBottom: props.insets.bottom }]}
    accessibilityRole="tablist"
  >
    <View style={styles.barRow}>
      <TabButtons {...props} iconSize={TAB_ICON} />
    </View>
  </View>
);

const Rail = (props: BottomTabBarProps) => (
  <View
    style={[
      styles.rail,
      {
        paddingLeft: props.insets.left,
        width: RAIL_WIDTH + props.insets.left,
      },
    ]}
    accessibilityRole="tablist"
  >
    <RailStatus />
    <TabButtons {...props} iconSize={RAIL_ICON} />
  </View>
);

export const ShellTabBar = (props: BottomTabBarProps) =>
  useIsLandscape() ? <Rail {...props} /> : <BottomBar {...props} />;

const styles = StyleSheet.create({
  bar: {
    backgroundColor: UiColors.surface,
    borderTopWidth: 1,
    borderTopColor: UiColors.border,
  },
  barRow: { height: TAB_BAR_HEIGHT, flexDirection: "row" },
  rail: {
    paddingVertical: 8,
    backgroundColor: UiColors.surface,
    borderRightWidth: 1,
    borderRightColor: UiColors.border,
  },
  railStatus: {
    height: RAIL_STATUS_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  railStatusText: {
    fontSize: RAIL_STATUS_SIZE,
    fontWeight: "700",
    color: UiColors.textSecondary,
  },
});
