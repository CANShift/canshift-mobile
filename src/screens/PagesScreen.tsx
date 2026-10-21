import { StyleSheet, View } from "react-native";
import { PAGES_STRINGS } from "../pages-strings";
import { UiColors } from "../theme/ui-tokens";
import { usePagesScreen } from "../hooks/use-pages-screen";
import { ScreenHead } from "../components/controls/ScreenHead";
import { PagesBody } from "../components/pages/PagesBody";

interface PagesScreenProps {
  backLabel: string;
  onBack: () => void;
}

const PagesScreen = ({ backLabel, onBack }: PagesScreenProps) => {
  const pages = usePagesScreen();
  return (
    <View style={styles.screen}>
      <ScreenHead
        title={PAGES_STRINGS.title}
        backLabel={backLabel}
        onBack={onBack}
      />
      <PagesBody pages={pages} />
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

export default PagesScreen;
