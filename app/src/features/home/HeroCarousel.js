import { memo, useEffect } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, { scrollTo, useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';

import { space } from '@/theme/tokens';
import { BannerCard } from './BannerCard';
import { CarouselDots } from './CarouselDots';
import { BANNER_GAP, BANNER_W, DOTS_H, SIDE } from './layout';

const PAGE = BANNER_W + BANNER_GAP;
const AUTOPLAY_MS = 4000;
const FIRST_SLIDE_DELAY_MS = 2500; // let home finish its first render before anything moves

function scrollToPage(ref, x) {
  'worklet';
  scrollTo(ref, x, 0, true);
}

/**
 * Finding P1. Slide position lives in a shared value on the UI thread: swiping,
 * auto-play and the dot indicator never cause a React re-render — of this
 * component or of home. Auto-play pauses while dragging, off screen and in the
 * background.
 */
function HeroCarouselImpl({ banners, visible }) {
  const ref = useAnimatedRef();
  const position = useSharedValue(0); // in pages
  const dragging = useSharedValue(false);
  const count = banners.length;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      position.set(e.contentOffset.x / PAGE);
    },
    onBeginDrag: () => {
      dragging.set(true);
    },
    onEndDrag: () => {
      dragging.set(false);
    },
  });

  useEffect(() => {
    if (count < 2) return undefined;
    let appActive = AppState.currentState === 'active';
    let timer;
    const tick = () => {
      if (!appActive || dragging.get() || !visible.get()) return;
      const next = (Math.round(position.get()) + 1) % count;
      scheduleOnUI(scrollToPage, ref, next * PAGE);
    };
    const start = setTimeout(() => {
      timer = setInterval(tick, AUTOPLAY_MS);
    }, FIRST_SLIDE_DELAY_MS);
    const sub = AppState.addEventListener('change', (s) => {
      appActive = s === 'active';
    });
    return () => {
      clearTimeout(start);
      if (timer) clearInterval(timer);
      sub.remove();
    };
  }, [count, dragging, position, ref, visible]);

  return (
    <View>
      <Animated.ScrollView
        ref={ref}
        horizontal
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={PAGE}
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        accessibilityLabel={`Offers, ${count} slides`}
      >
        {banners.map((b, i) => (
          <BannerCard key={b.id} banner={b} index={i} />
        ))}
      </Animated.ScrollView>
      <View style={styles.dotsRow}>
        <CarouselDots count={count} position={position} />
      </View>
    </View>
  );
}

export const HeroCarousel = memo(HeroCarouselImpl);

const styles = StyleSheet.create({
  content: { paddingHorizontal: SIDE, gap: BANNER_GAP },
  dotsRow: { height: DOTS_H, justifyContent: 'center', marginTop: space.xs },
});
