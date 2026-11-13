import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { requestOtp } from '@/api/mockApi';
import { DEMO_DEVICE_NUMBER, isValidIndianMobile } from '@/features/auth/phone';
import { useSessionStore } from '@/features/auth/sessionStore';
import { ValueProps } from '@/features/auth/ValueProps';
import { useAddressStore } from '@/features/location/addressStore';
import { hideSplash } from '@/lib/splash';
import { border, colors, fontSize, fontWeight, radius, space, touch } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { EggMark } from '@/ui/EggMark';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const continueAsGuest = useSessionStore((s) => s.continueAsGuest);
  const locationDone = useAddressStore((s) => s.locationStepDone);
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  useEffect(hideSplash, []);

  const valid = isValidIndianMobile(phone);
  const formatError = phone.length === 10 && !valid;
  const nextRoute = locationDone ? '/' : '/location';

  const onGuest = () => {
    continueAsGuest();
    router.replace(nextRoute);
  };

  const onGetOtp = async () => {
    setSending(true);
    setSendError(null);
    try {
      const { requestId } = await requestOtp(phone);
      router.push({ pathname: '/otp', params: { phone, requestId } });
    } catch {
      setSendError('Couldn’t send the code. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl },
        ]}
      >
        <View style={styles.brand}>
          <Text style={styles.wordmark} accessibilityRole="header">
            EGGOZ
          </Text>
          <Text style={styles.conceptTag}>Concept redesign</Text>
        </View>

        <View style={styles.hero}>
          <EggMark size={72} />
          <Text style={styles.headline}>Farm-fresh eggs at your door before sunrise</Text>
        </View>

        <ValueProps />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Log in or sign up</Text>
          <Text style={styles.label}>Mobile number</Text>
          <View style={[styles.inputRow, focused && styles.inputFocused, formatError && styles.inputError]}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType="number-pad"
              maxLength={10}
              autoComplete="tel-national"
              textContentType="telephoneNumber"
              placeholder="10-digit mobile number"
              placeholderTextColor={colors.inkPlaceholder}
              accessibilityLabel="Mobile number"
              style={styles.input}
            />
          </View>
          {formatError ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              Indian mobile numbers start with 6, 7, 8 or 9.
            </Text>
          ) : (
            <Text style={styles.helper}>We’ll text you a 6-digit code.</Text>
          )}
          {phone.length === 0 ? (
            <Button
              variant="text"
              icon="phone-portrait-outline"
              label="Use this phone’s number"
              onPress={() => setPhone(DEMO_DEVICE_NUMBER)}
              style={styles.hintButton}
            />
          ) : null}
          <Button label="Get OTP" onPress={onGetOtp} disabled={!valid} loading={sending} />
          {sendError ? <Text style={styles.error}>{sendError}</Text> : null}
        </View>

        <Button
          variant="secondary"
          icon="storefront-outline"
          label="Explore as guest"
          accessibilityHint="Browse and fill your cart without logging in"
          onPress={onGuest}
        />
        <Text style={styles.terms}>By continuing you agree to the Terms of Service and Privacy Policy.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.brandCream },
  content: { paddingHorizontal: space.lg, gap: space.lg },
  brand: { alignItems: 'center', gap: 2 },
  wordmark: { fontSize: 34, fontWeight: fontWeight.heavy, letterSpacing: 3, color: colors.inkPrimary },
  conceptTag: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.brandOrangeStrong,
  },
  hero: { alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  headline: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.inkPrimary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: space.xl,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.sheet,
    padding: space.lg,
    gap: space.sm,
    borderWidth: border.hairline,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.inkPrimary,
    marginBottom: space.xs,
  },
  label: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: colors.inkPrimary },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touch.min + 4,
    borderWidth: border.control,
    borderColor: colors.borderStrong,
    borderRadius: radius.card,
    paddingHorizontal: space.md,
    gap: space.sm,
  },
  inputFocused: { borderColor: colors.brandOrangeStrong },
  inputError: { borderColor: colors.danger },
  prefix: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.semibold, color: colors.inkPrimary },
  input: { flex: 1, fontSize: fontSize.bodyLg, color: colors.inkPrimary, paddingVertical: space.sm },
  helper: { fontSize: fontSize.caption, color: colors.inkSecondary },
  error: { fontSize: fontSize.caption, color: colors.danger },
  hintButton: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  terms: { fontSize: fontSize.caption, color: colors.inkSecondary, textAlign: 'center' },
});
