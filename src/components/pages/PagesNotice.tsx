import { StyleSheet, View } from "react-native";
import { EmptyCard } from "../cards/EmptyCard";
import { BigButton } from "../buttons/BigButton";
import { Glyph, type GlyphName } from "../icons/Glyph";
import type { PagesNoticeCopy, PagesViewKind } from "../../lib/pages-view";
import { PAGES_STRINGS } from "../../pages-strings";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";

const ICON_SIZE = 32;

const NOTICE_GLYPHS: Record<Exclude<PagesViewKind, "list">, GlyphName> = {
  loading: "frames",
  unsupported: "info",
  failed: "warning",
  empty: "frames",
};

export interface PagesNoticeProps {
  kind: Exclude<PagesViewKind, "list">;
  copy: PagesNoticeCopy;
  onRetry: () => void;
}

export const PagesNotice = ({ kind, copy, onRetry }: PagesNoticeProps) => (
  <View style={styles.notice}>
    <EmptyCard
      icon={
        <Glyph
          name={NOTICE_GLYPHS[kind]}
          size={ICON_SIZE}
          color={UiColors.textMuted}
        />
      }
      title={copy.title}
      body={copy.body}
    />
    {copy.retry ? (
      <BigButton
        label={PAGES_STRINGS.retry}
        tone="outline"
        height={TouchTarget.driving}
        onPress={onRetry}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  notice: { flex: 1, gap: 10 },
});
