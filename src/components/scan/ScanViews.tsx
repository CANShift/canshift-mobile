import { FlatList, StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import type { ScanScreenModel } from "../../hooks/use-scan-screen";
import type { ScanView } from "../../lib/scan-view";
import { Glyph } from "../icons/Glyph";
import { ScanHero } from "./ScanHero";
import { ScanActions } from "./ScanActions";
import { ScanRadar } from "./ScanRadar";
import { DashCard } from "./DashCard";

export interface ScanViewProps {
  model: ScanScreenModel;
}

const bluetoothIcon = (
  <Glyph name="bluetooth" size={40} color={UiColors.text} strokeWidth={2} />
);

const PermissionView = ({ model }: ScanViewProps) => (
  <>
    <ScanHero
      icon={bluetoothIcon}
      title={STRINGS.connect.permissionTitle}
      body={STRINGS.connect.permissionBody}
      hint={STRINGS.connect.permissionHint}
    />
    <ScanActions
      primary={{
        label: STRINGS.connect.permissionContinue,
        onPress: model.continueFirstRun,
      }}
      secondary={{ label: STRINGS.connect.tryDemo, onPress: model.startDemo }}
    />
  </>
);

const DeniedView = ({ model }: ScanViewProps) => (
  <>
    <ScanHero
      icon={bluetoothIcon}
      title={STRINGS.connect.deniedTitle}
      body={STRINGS.connect.deniedBody}
      hint={STRINGS.connect.deniedPath}
    />
    <ScanActions
      primary={{
        label: STRINGS.connect.openSettings,
        onPress: model.openSettings,
        tone: "light",
      }}
      secondary={{ label: STRINGS.connect.tryDemo, onPress: model.startDemo }}
    />
  </>
);

const EmptyView = ({ model }: ScanViewProps) => (
  <>
    <ScanHero
      icon={bluetoothIcon}
      title={STRINGS.connect.emptyTitle}
      body={STRINGS.connect.emptyBody}
    />
    <ScanActions
      primary={{
        label: STRINGS.connect.scan,
        onPress: () => void model.scan.startScan(),
      }}
      secondary={{ label: STRINGS.connect.tryDemo, onPress: model.startDemo }}
    />
  </>
);

const ReconnectingView = ({ model }: ScanViewProps) => (
  <>
    <ScanHero
      icon={bluetoothIcon}
      title={STRINGS.connect.emptyTitle}
      body={STRINGS.connect.reconnectingHint}
    />
    <ScanActions
      primary={{
        label: STRINGS.connect.scan,
        onPress: () => void model.scan.startScan(),
        disabled: true,
      }}
      secondary={{ label: STRINGS.connect.tryDemo, onPress: model.startDemo }}
    />
  </>
);

const ScanningView = ({ model }: ScanViewProps) => (
  <>
    <Text style={styles.title} accessibilityRole="header">
      {STRINGS.connect.scanning}
    </Text>
    <ScanRadar />
    <Text style={styles.centered}>{STRINGS.connect.scanningHint}</Text>
    <ScanActions
      primary={{
        label: STRINGS.connect.stopScanning,
        onPress: model.scan.stopScan,
        tone: "outline",
      }}
    />
  </>
);

const FoundView = ({ model }: ScanViewProps) => (
  <>
    <Text style={styles.title} accessibilityRole="header">
      {STRINGS.connect.foundTitle}
    </Text>
    <Text style={styles.hint}>{STRINGS.connect.tapToConnect}</Text>
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={model.scan.devices}
      keyExtractor={(dash) => dash.id}
      renderItem={({ item }) => (
        <DashCard
          dash={item}
          lastUsed={item.id === model.scan.lastPairedId}
          onPress={(dash) => void model.scan.connectTo(dash)}
        />
      )}
    />
    {model.scan.scanning ? null : (
      <Text style={styles.hint}>
        {STRINGS.connect.searchFinished(model.scan.devices.length)}
      </Text>
    )}
    <ScanActions
      primary={{
        label: STRINGS.connect.scanAgain,
        onPress: () => void model.scan.startScan(),
        tone: "outline",
        disabled: model.scan.scanning,
      }}
      secondary={{ label: STRINGS.connect.tryDemo, onPress: model.startDemo }}
    />
  </>
);

const SCAN_VIEWS: Record<
  ScanView,
  (props: ScanViewProps) => React.JSX.Element
> = {
  permission: PermissionView,
  denied: DeniedView,
  empty: EmptyView,
  reconnecting: ReconnectingView,
  scanning: ScanningView,
  found: FoundView,
};

export const ScanBody = ({ model }: ScanViewProps) => {
  const Rendered = SCAN_VIEWS[model.view];
  return (
    <View style={styles.body}>
      <Rendered model={model} />
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 20,
  },
  title: { fontSize: 32, fontWeight: "700", color: UiColors.text },
  centered: {
    fontSize: 17,
    lineHeight: 25,
    color: UiColors.textSecondary,
    textAlign: "center",
  },
  hint: { fontSize: 14, color: UiColors.textMuted },
  list: { flexGrow: 0 },
  listContent: { gap: 10 },
});
