import { StyleSheet, View } from "react-native";
import { HISTORY_STRINGS } from "../history-strings";
import { UiColors } from "../theme/ui-tokens";
import { useSessionDetail } from "../hooks/use-session-detail";
import { ScreenHead } from "../components/controls/ScreenHead";
import { SessionDetailBody } from "../components/history/SessionDetailBody";

interface SessionDetailScreenProps {
  sessionKey: string;
  onBack: () => void;
}

const SessionDetailScreen = ({
  sessionKey,
  onBack,
}: SessionDetailScreenProps) => {
  const detail = useSessionDetail(sessionKey, onBack);
  return (
    <View style={styles.screen}>
      <ScreenHead
        title={HISTORY_STRINGS.detailTitle}
        backLabel={HISTORY_STRINGS.backToSessions}
        onBack={onBack}
      />
      {detail === null ? null : <SessionDetailBody detail={detail} />}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 4,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
    backgroundColor: UiColors.bg,
  },
});

export default SessionDetailScreen;
