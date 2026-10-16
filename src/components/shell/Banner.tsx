import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { UiColors } from "../../theme/ui-tokens";

export interface BannerProps {
  height: number;
  children: ReactNode;
}

export const Banner = ({ height, children }: BannerProps) => (
  <View
    style={[styles.banner, { minHeight: height }]}
    accessibilityRole="alert"
    accessibilityLiveRegion="polite"
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  banner: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    backgroundColor: UiColors.warningBg,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
