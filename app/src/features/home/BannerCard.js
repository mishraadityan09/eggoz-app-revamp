import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, space } from '@/theme/tokens';
import { EggMark } from '@/ui/EggMark';
import { ProductPhoto } from '@/ui/ProductPhoto';
import { BANNER_H, BANNER_W } from './layout';

/** One theme per slide position. Every pairing keeps text at WCAG AA or better. */
const THEMES = [
  { bg: colors.brandOrangeStrong, ink: colors.inkOnPrimary }, // 5.18:1
  { bg: colors.accentSubscribe, ink: colors.inkOnPrimary }, // 5.38:1
  { bg: colors.brandHeader, ink: colors.inkPrimary }, // 9.32:1
  { bg: colors.inkPrimary, ink: colors.inkOnPrimary }, // 17.4:1
  { bg: colors.rewardBg, ink: colors.rewardInk }, // 4.97:1
];

const PHOTO = Math.round(BANNER_H * 0.72);

/**
 * In-app designed banner: live text (crisp, translatable, accessible) plus a small
 * product photo — instead of one large flattened image with a celebrity photo.
 * Milestone 2 puts these in the UI-thread carousel.
 */
function BannerCardImpl({ banner, index, onPress }) {
  const theme = THEMES[index % THEMES.length] ?? THEMES[0];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${banner.title}, ${banner.subtitle}`}
      style={[styles.banner, { backgroundColor: theme.bg }]}
    >
      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.ink }]}>{banner.title}</Text>
        <Text style={[styles.subtitle, { color: theme.ink }]}>{banner.subtitle}</Text>
      </View>
      {banner.image ? (
        <ProductPhoto image={banner.image} size={PHOTO} radius={radius.card} />
      ) : (
        <EggMark size={BANNER_H * 0.5} />
      )}
    </Pressable>
  );
}

export const BannerCard = memo(BannerCardImpl);

const styles = StyleSheet.create({
  banner: {
    width: BANNER_W,
    height: BANNER_H,
    borderRadius: radius.card,
    paddingHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    overflow: 'hidden',
  },
  text: { flex: 1, gap: space.xs },
  title: { fontSize: fontSize.display, fontWeight: fontWeight.heavy },
  subtitle: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, lineHeight: 20 },
});
