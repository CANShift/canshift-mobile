import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { Colors, Fonts, Typography, Spacing, HitSlop } from "../theme";

interface ScreenHeaderProps {
  title: string;
  onBack?: (() => void) | undefined;
}

const HEADER_RULE = 2;
const TITLE_SIZE = Typography.xl;
const TITLE_TRACKING = TITLE_SIZE * -0.02;

export const ScreenHeader = ({ title, onBack }: ScreenHeaderProps) => (
  <View style={styles.header}>
    {onBack && (
      <TouchableOpacity
        onPress={onBack}
        hitSlop={HitSlop.default}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <ChevronLeft size={18} color={Colors.accent} />
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>
    )}
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: HEADER_RULE,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  back: { fontSize: Typography.md, color: Colors.accent },
  title: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: TITLE_SIZE,
    letterSpacing: TITLE_TRACKING,
    color: Colors.text,
  },
});
