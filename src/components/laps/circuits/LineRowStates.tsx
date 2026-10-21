import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../../strings";
import { CIRCUIT_STRINGS } from "../../../circuit-strings";
import type { LineRowKind } from "../../../lib/line-row";
import { UiColors } from "../../../theme/ui-tokens";
import { Glyph } from "../../icons/Glyph";
import { ToolButton } from "../../buttons/ToolButton";

export interface LineStateProps {
  armedName: string | null;
  onReset: () => void;
  onSetHere: () => void;
  onSave: () => void;
  onManage: () => void;
}

interface LineStateFrameProps {
  label: string;
  set: boolean;
  children?: ReactNode;
}

const LineStateFrame = ({ label, set, children }: LineStateFrameProps) => (
  <View style={styles.state}>
    {set ? <Glyph name="check" size={16} color={UiColors.success} /> : null}
    <Text style={set ? styles.set : styles.notSet} numberOfLines={1}>
      {label}
    </Text>
    {children}
  </View>
);

const NotSet = ({ children }: { children?: ReactNode }) => (
  <LineStateFrame label={STRINGS.laps.lineNotSet} set={false}>
    {children}
  </LineStateFrame>
);

const Manage = ({ onManage }: Pick<LineStateProps, "onManage">) => (
  <ToolButton label={CIRCUIT_STRINGS.manage} onPress={onManage} />
);

const Reset = ({ onReset }: Pick<LineStateProps, "onReset">) => (
  <ToolButton label={STRINGS.laps.resetLine} onPress={onReset} />
);

export const LINE_STATES: Record<
  LineRowKind,
  (props: LineStateProps) => React.JSX.Element
> = {
  unset: () => <NotSet />,
  unsetWithCircuits: (p) => (
    <NotSet>
      <Manage onManage={p.onManage} />
    </NotSet>
  ),
  nearCircuit: (p) => (
    <NotSet>
      <ToolButton label={CIRCUIT_STRINGS.setHere} onPress={p.onSetHere} />
      <Manage onManage={p.onManage} />
    </NotSet>
  ),
  unsaved: (p) => (
    <LineStateFrame label={STRINGS.laps.lineSet} set>
      <ToolButton label={CIRCUIT_STRINGS.save} onPress={p.onSave} />
      <Reset onReset={p.onReset} />
    </LineStateFrame>
  ),
  saved: (p) => (
    <LineStateFrame label={p.armedName ?? STRINGS.laps.lineSet} set>
      <Reset onReset={p.onReset} />
    </LineStateFrame>
  ),
};

const styles = StyleSheet.create({
  state: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  set: { flexShrink: 1, fontSize: 15, color: UiColors.success },
  notSet: { fontSize: 15, color: UiColors.textMuted },
});
