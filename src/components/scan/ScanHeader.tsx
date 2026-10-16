import { Pressable, StyleSheet, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";
import { useLink } from "../../hooks/use-link";
import { Header } from "../shell/Header";
import { Glyph } from "../icons/Glyph";

export interface ScanHeaderProps {
  onInfo: () => void;
}

export const ScanHeader = ({ onInfo }: ScanHeaderProps) => (
  <View>
    <Header link={useLink()} dashName={null} badge="none" />
    <Pressable
      style={styles.info}
      onPress={onInfo}
      accessibilityRole="button"
      accessibilityLabel={STRINGS.connect.appInfo}
    >
      <Glyph
        name="info"
        size={24}
        color={UiColors.textSecondary}
        strokeWidth={2}
      />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  info: {
    position: "absolute",
    right: 8,
    bottom: 6,
    width: TouchTarget.min,
    height: TouchTarget.min,
    alignItems: "center",
    justifyContent: "center",
  },
});
