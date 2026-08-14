import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Colors, Typography, Fonts, Spacing } from "../../theme";

export type SegmentedControlVariant = "fill" | "inline";

export interface SegmentedControlOption<
  T extends string | number | boolean | null,
> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number | boolean | null> {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  variant?: SegmentedControlVariant;
}

export const SegmentedControl = <T extends string | number | boolean | null>({
  options,
  value,
  onChange,
  disabled = false,
  variant = "fill",
}: SegmentedControlProps<T>) => {
  const skin = VARIANTS[variant];

  return (
    <View style={skin.track} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            style={[skin.segment, active && skin.segmentActive]}
            onPress={() => {
              onChange(option.value);
            }}
            disabled={disabled}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled }}
            accessibilityLabel={option.label}
          >
            <Text style={[skin.label, active && skin.labelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const SEGMENT_UNDERLINE = 3;
const PLANCHE_SCALE = 1.3;
const INLINE_GAP = Math.round(22 * PLANCHE_SCALE);
const INLINE_PADDING_Y = Math.round(14 * PLANCHE_SCALE);
const INLINE_LABEL_SIZE = Math.round(11 * PLANCHE_SCALE);
const INLINE_TRACKING_EM = 0.1;
const INLINE_UNDERLINE_GAP = Math.round(4 * PLANCHE_SCALE);

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.ruleHair,
  },
  trackInline: {
    flexDirection: "row",
    gap: INLINE_GAP,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ruleHair,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: SEGMENT_UNDERLINE,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  segmentActive: { borderBottomColor: Colors.accent },
  segmentInline: {
    minHeight: 40,
    justifyContent: "center",
    paddingVertical: INLINE_PADDING_Y,
  },
  label: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.sm,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.textMuted,
  },
  labelActive: { color: Colors.text },
  labelInline: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: INLINE_LABEL_SIZE,
    letterSpacing: INLINE_LABEL_SIZE * INLINE_TRACKING_EM,
    textTransform: "uppercase",
    color: Colors.textMuted,
    paddingBottom: INLINE_UNDERLINE_GAP,
    borderBottomWidth: SEGMENT_UNDERLINE,
    borderBottomColor: "transparent",
  },
  labelActiveInline: {
    color: Colors.accent,
    borderBottomColor: Colors.accent,
  },
});

interface SegmentedControlSkin {
  track: ViewStyle;
  segment: ViewStyle;
  segmentActive: ViewStyle;
  label: TextStyle;
  labelActive: TextStyle;
}

const VARIANTS: Record<SegmentedControlVariant, SegmentedControlSkin> = {
  fill: {
    track: styles.track,
    segment: styles.segment,
    segmentActive: styles.segmentActive,
    label: styles.label,
    labelActive: styles.labelActive,
  },
  inline: {
    track: styles.trackInline,
    segment: styles.segmentInline,
    segmentActive: {},
    label: styles.labelInline,
    labelActive: styles.labelActiveInline,
  },
};
