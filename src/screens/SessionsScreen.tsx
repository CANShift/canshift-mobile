import { StyleSheet, View } from "react-native";
import { HISTORY_STRINGS } from "../history-strings";
import { UiColors } from "../theme/ui-tokens";
import { useSessionHistory } from "../hooks/use-session-history";
import { ScreenHead } from "../components/controls/ScreenHead";
import { CantSaveNote } from "../components/laps/CantSaveNote";
import { SessionList } from "../components/history/SessionList";

interface SessionsScreenProps {
  onBack: () => void;
  onOpen: (key: string) => void;
}

const SessionsScreen = ({ onBack, onOpen }: SessionsScreenProps) => {
  const history = useSessionHistory();
  return (
    <View style={styles.screen}>
      <ScreenHead
        title={HISTORY_STRINGS.title}
        backLabel={HISTORY_STRINGS.backToLaps}
        onBack={onBack}
      />
      {history.storageNote === null ? null : (
        <CantSaveNote
          message={history.storageNote}
          onDismiss={history.dismissStorageNote}
        />
      )}
      <SessionList sessions={history.sessions} onOpen={onOpen} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 4,
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: UiColors.bg,
  },
});

export default SessionsScreen;
