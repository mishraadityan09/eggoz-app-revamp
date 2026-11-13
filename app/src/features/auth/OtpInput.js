import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { border, colors, fontSize, fontWeight, radius, space } from '@/theme/tokens';

export const OTP_LENGTH = 6;

/**
 * Six boxes backed by one hidden TextInput. `autoComplete="sms-otp"` lets Android
 * offer the code from the SMS; the screen also simulates SMS Retriever auto-fill.
 */
export function OtpInput({ value, onChange, error = false, disabled = false }) {
  const inputRef = useRef(null);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.row} accessible={false}>
      {Array.from({ length: OTP_LENGTH }, (_, i) => (
        <View
          key={i}
          style={[styles.box, i === value.length && !disabled && styles.boxActive, error && styles.boxError]}
        >
          <Text style={styles.digit}>{value[i] ?? ''}</Text>
        </View>
      ))}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, OTP_LENGTH))}
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        autoFocus
        editable={!disabled}
        caretHidden
        accessibilityLabel="6-digit verification code"
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  box: {
    flex: 1,
    aspectRatio: 0.85,
    maxWidth: 56,
    borderWidth: border.control,
    borderColor: colors.borderStrong,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: colors.brandOrangeStrong },
  boxError: { borderColor: colors.danger },
  digit: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.inkPrimary },
  hiddenInput: { ...StyleSheet.absoluteFill, opacity: 0, fontSize: fontSize.body },
});
