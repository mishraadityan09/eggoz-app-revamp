import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { border, colors, fontSize, fontWeight, radius, space } from '@/theme/tokens';
import { frequencyLabel, frequencyShort } from './schedule';
import { useScheduleSheet, useSubscriptionStore } from './subscriptionStore';

const HIT = { top: 8, bottom: 8, left: 4, right: 4 }; // 32dp row + slop = 48dp target

/**
 * Eggoz's calendar icon, kept — but labelled (finding U5) and usable by guests.
 */
function ScheduleButtonImpl({ productId, productName, height }) {
  const schedule = useSubscriptionStore((s) => s.schedules[productId]);
  const open = useScheduleSheet((s) => s.open);
  const onPress = useCallback(() => open(productId), [open, productId]);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={
        schedule
          ? `${productName} scheduled ${frequencyLabel(schedule.frequency)}. Edit schedule`
          : `Schedule deliveries of ${productName} and save 5 percent`
      }
      style={[styles.button, { height }, schedule ? styles.scheduled : null]}
    >
      <Ionicons
        name={schedule ? 'checkmark-circle' : 'calendar-outline'}
        size={16}
        color={schedule ? colors.success : colors.accentSubscribe}
      />
      <Text numberOfLines={1} style={[styles.text, schedule ? styles.scheduledText : null]}>
        {schedule ? frequencyShort(schedule.frequency) : 'Schedule · save 5%'}
      </Text>
    </Pressable>
  );
}

export const ScheduleButton = memo(ScheduleButtonImpl);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    paddingHorizontal: space.sm,
    borderRadius: radius.chip,
    borderWidth: border.control,
    borderColor: colors.accentSubscribe,
  },
  scheduled: { borderColor: colors.success, backgroundColor: colors.successBg },
  text: { flexShrink: 1, fontSize: fontSize.caption, fontWeight: fontWeight.bold, color: colors.accentSubscribe },
  scheduledText: { color: colors.success },
});
