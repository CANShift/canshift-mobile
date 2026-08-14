import { View, Text, StyleSheet } from "react-native";
import {
  Colors,
  Typography,
  Spacing,
  Fonts,
  SCREEN_PADDING,
  SCREEN_RULE,
} from "../theme";
import { useLinkStatus } from "../hooks/use-link-status";
import { linkLostLabel, type LinkState } from "../lib/link-hold";

export interface DashTopBarProps {
  title: string;
}

const HEADER_NOTE: Record<LinkState, (seconds: number) => string | null> = {
  live: () => null,
  waiting: () => "NO DATA",
  lost: (seconds) => linkLostLabel(seconds),
};

const DashTopBar = ({ title }: DashTopBarProps) => {
  const { state, secondsAgo } = useLinkStatus();
  const note = HEADER_NOTE[state](secondsAgo);

  return (
    <View style={styles.header}>
      <View style={styles.rule}>
        <Text style={styles.title}>{title}</Text>
        {note === null ? null : <Text style={styles.note}>{note}</Text>}
      </View>
    </View>
  );
};

const HEADER_TITLE_SIZE = Typography.xl;
const HEADER_TITLE_TRACKING = HEADER_TITLE_SIZE * -0.02;
const HEADER_NOTE_SIZE = 14;
const HEADER_NOTE_GAP = 8;
const HEADER_PADDING_BOTTOM = 18;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: Spacing.md,
  },
  rule: {
    borderBottomWidth: SCREEN_RULE,
    borderBottomColor: Colors.border,
    paddingBottom: HEADER_PADDING_BOTTOM,
  },
  title: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: HEADER_TITLE_SIZE,
    letterSpacing: HEADER_TITLE_TRACKING,
    color: Colors.text,
  },
  note: {
    fontFamily: Fonts.mono,
    fontSize: HEADER_NOTE_SIZE,
    color: Colors.warning,
    marginTop: HEADER_NOTE_GAP,
  },
});

export default DashTopBar;
