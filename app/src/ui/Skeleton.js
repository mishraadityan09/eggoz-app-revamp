import { useEffect } from 'react';

import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius as radii } from '@/theme/tokens';

/** Pulsing placeholder. Animates on the UI thread; sized exactly like the real content (P3). */
export function Skeleton({ width, height, radius = radii.chip, style }) {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.set(withRepeat(withTiming(1, { duration: 700 }), -1, true));
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.skeleton }, animated, style]}
    />
  );
}
