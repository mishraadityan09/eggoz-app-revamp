import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { colors } from '@/theme/tokens';

const DOT = 8;
const GAP = 8;

const Dot = memo(function Dot({ index, position }) {
  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      Math.min(Math.abs(position.get() - index), 1),
      [0, 1],
      [colors.brandOrangeStrong, colors.borderStrong],
    ),
  }));
  return <Animated.View style={[styles.dot, style]} />;
});

/**
 * Page indicator driven by the carousel's shared value (UI thread, no React renders).
 * Every dot is the same size with the same gap; only the colour marks the active slide.
 */
function CarouselDotsImpl({ count, position }) {
  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} index={i} position={position} />
      ))}
    </View>
  );
}

export const CarouselDots = memo(CarouselDotsImpl);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: GAP },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
});
