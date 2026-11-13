import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { border, colors, fontSize, fontWeight, radius, space, touch } from '@/theme/tokens';

function ButtonImpl({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  accessibilityHint,
  style,
  testID,
}) {
  const inactive = disabled || loading;
  const v = VARIANTS[variant];
  const textColor = inactive && variant !== 'text' ? colors.inkSecondary : v.textColor;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      android_ripple={{ color: v.ripple }}
      style={({ pressed }) => [
        styles.base,
        v.container,
        inactive && variant !== 'text' && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.textColor} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={18} color={textColor} /> : null}
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export const Button = memo(ButtonImpl);

const VARIANTS = {
  primary: {
    container: { backgroundColor: colors.brandOrangeStrong },
    textColor: colors.inkOnPrimary,
    ripple: 'rgba(255,255,255,0.2)',
  },
  secondary: {
    container: {
      backgroundColor: colors.surfaceCard,
      borderWidth: border.control,
      borderColor: colors.borderStrong,
    },
    textColor: colors.inkPrimary,
    ripple: 'rgba(0,0,0,0.06)',
  },
  text: {
    container: { backgroundColor: 'transparent' },
    textColor: colors.brandOrangeStrong,
    ripple: 'rgba(194,65,12,0.1)',
  },
};

const styles = StyleSheet.create({
  base: {
    minHeight: touch.min,
    borderRadius: radius.card,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  label: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold },
  disabled: { backgroundColor: colors.skeleton, borderColor: colors.skeleton },
  pressed: { opacity: 0.9 },
});
