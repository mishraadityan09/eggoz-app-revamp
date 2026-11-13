import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { border, colors, fontSize, fontWeight, radius } from '@/theme/tokens';
import { ROW } from './layout';

const HIT = { top: 4, bottom: 4, left: 4, right: 4 }; // 40dp control + 8dp slop = 48dp target

function StepperImpl({ qty, itemLabel, onAdd, onRemove }) {
  if (qty === 0) {
    return (
      <Pressable
        onPress={onAdd}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityLabel={`Add ${itemLabel} to cart`}
        style={[styles.base, styles.add]}
      >
        <Text style={styles.addText}>Add</Text>
      </Pressable>
    );
  }
  return (
    <View style={[styles.base, styles.filled]} accessibilityLabel={`${qty} in cart`}>
      <Pressable
        onPress={onRemove}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityLabel={`Remove one ${itemLabel}`}
        style={styles.side}
      >
        <Ionicons name="remove" size={18} color={colors.inkOnPrimary} />
      </Pressable>
      <Text style={styles.qty} accessibilityLiveRegion="polite">
        {qty}
      </Text>
      <Pressable
        onPress={onAdd}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityLabel={`Add one more ${itemLabel}`}
        style={styles.side}
      >
        <Ionicons name="add" size={18} color={colors.inkOnPrimary} />
      </Pressable>
    </View>
  );
}

export const Stepper = memo(StepperImpl);

const styles = StyleSheet.create({
  base: { height: ROW.stepper, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  add: { borderWidth: border.control, borderColor: colors.brandOrangeStrong, backgroundColor: colors.surfaceCard },
  addText: { fontSize: fontSize.body, fontWeight: fontWeight.bold, color: colors.brandOrangeStrong },
  filled: { flexDirection: 'row', backgroundColor: colors.brandOrangeStrong, justifyContent: 'space-between' },
  side: { width: 40, height: ROW.stepper, alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, color: colors.inkOnPrimary },
});
