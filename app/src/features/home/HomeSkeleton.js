import { StyleSheet, View } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { Skeleton } from '@/ui/Skeleton';
import { BANNER_H, BANNER_W, CARD_GAP, CARD_H, CARD_W, CAROUSEL_H, DOTS_H, SECTION_TITLE_H, SIDE } from './layout';

/** Same geometry as HomeFeed, so the swap to real content causes no layout shift (P3). */
export function HomeSkeleton() {
  return (
    <View style={styles.root} accessibilityLabel="Loading products" accessibilityRole="progressbar">
      <View style={styles.bannerWrap}>
        <Skeleton width={BANNER_W} height={BANNER_H} radius={radius.card} />
        <View style={styles.dots} />
      </View>
      {[0, 1].map((section) => (
        <View key={section}>
          <View style={styles.titleWrap}>
            <Skeleton width={150} height={22} />
          </View>
          <View style={styles.rail}>
            {[0, 1, 2].map((card) => (
              <Skeleton key={card} width={CARD_W} height={CARD_H} radius={radius.card} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  bannerWrap: { height: CAROUSEL_H, paddingTop: space.lg, paddingHorizontal: SIDE },
  dots: { height: DOTS_H + space.xs },
  titleWrap: { height: SECTION_TITLE_H, paddingHorizontal: SIDE, justifyContent: 'center' },
  rail: { flexDirection: 'row', gap: CARD_GAP, paddingHorizontal: SIDE },
});
