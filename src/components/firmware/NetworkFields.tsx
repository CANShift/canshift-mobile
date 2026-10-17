import { StyleSheet, Text, TextInput, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";
import type { WorkshopNetwork } from "../../services/workshop/workshop-network";

const F = STRINGS.firmware;

export interface NetworkFieldsProps {
  network: WorkshopNetwork;
  onChange: (network: WorkshopNetwork) => void;
}

interface FieldProps {
  label: string;
  value: string;
  secure: boolean;
  onChange: (value: string) => void;
}

const Field = ({ label, value, secure, onChange }: FieldProps) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      accessibilityLabel={label}
      autoCorrect={false}
      autoCapitalize="none"
      secureTextEntry={secure}
      placeholderTextColor={UiColors.textMuted}
    />
  </View>
);

export const NetworkFields = ({ network, onChange }: NetworkFieldsProps) => (
  <View style={styles.fields}>
    <Field
      label={F.networkName}
      value={network.ssid}
      secure={false}
      onChange={(ssid) => {
        onChange({ ...network, ssid });
      }}
    />
    <Field
      label={F.password}
      value={network.password}
      secure
      onChange={(password) => {
        onChange({ ...network, password });
      }}
    />
  </View>
);

const styles = StyleSheet.create({
  fields: { gap: 12 },
  field: { gap: 6 },
  label: { fontSize: 14, color: UiColors.textMuted },
  input: {
    minHeight: TouchTarget.min,
    paddingHorizontal: 12,
    borderRadius: UiRadius.control,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
    fontSize: 16,
    color: UiColors.text,
  },
});
