import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeftIcon } from "./ChevronLeftIcon";
import {
  Colors,
  Fonts,
  Typography,
  Spacing,
  HitSlop,
  SCREEN_PADDING,
} from "../theme";

const HEADER_RULE = 2;
const BACK_ICON_SIZE = 18;
const TITLE_SIZE = 26;
const TITLE_TRACKING = TITLE_SIZE * -0.02;
const TITLE_PADDING_TOP = 12;
const TITLE_PADDING_BOTTOM = 18;

interface ScreenHeaderProps {
  title: string;
  onBack?: (() => void) | undefined;
}

export const ScreenHeader = ({ title, onBack }: ScreenHeaderProps) => (
  <View style={styles.header}>
    <View style={styles.row}>
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          hitSlop={HitSlop.default}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeftIcon size={BACK_ICON_SIZE} color={Colors.accent} />
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SCREEN_PADDING,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingTop: TITLE_PADDING_TOP,
    paddingBottom: TITLE_PADDING_BOTTOM,
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
