import { StyleSheet, Text, View } from "react-native";
import { PAGES_STRINGS } from "../pages-strings";
import { UiColors } from "../theme/ui-tokens";
import { usePagesScreen } from "../hooks/use-pages-screen";
import { BackRow } from "../components/controls/BackRow";
import { PagesBody } from "../components/pages/PagesBody";

interface PagesScreenProps {
  backLabel: string;
  onBack: () => void;
}

const PagesScreen = ({ backLabel, onBack }: PagesScreenProps) => {
  const pages = usePagesScreen();
  return (
    <View style={styles.screen}>
      <View style={styles.head}>
        <BackRow label={backLabel} onPress={onBack} />
        <Text style={styles.title} accessibilityRole="header">
          {PAGES_STRINGS.title}
        </Text>
      </View>
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
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "700", color: UiColors.text },
});

export default PagesScreen;
