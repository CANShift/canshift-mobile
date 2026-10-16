import { StyleSheet, Text } from "react-native";
import { UiColors } from "../../theme/ui-tokens";

const TAG_HEIGHT = 28;
const TAG_SIZE = 13;

export interface BannerTagProps {
  label: string;
}

export const BannerTag = ({ label }: BannerTagProps) => (
  <Text style={styles.tag}>{label}</Text>
);

const styles = StyleSheet.create({
  tag: {
    height: TAG_HEIGHT,
    lineHeight: TAG_HEIGHT,
    paddingHorizontal: 10,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: UiColors.warning,
    color: UiColors.bg,
    fontSize: TAG_SIZE,
    fontWeight: "800",
    letterSpacing: TAG_SIZE * 0.06,
  },
});
