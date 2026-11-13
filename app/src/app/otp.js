import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEMO_OTP, requestOtp, verifyOtp } from '@/api/mockApi';
import { OTP_LENGTH, OtpInput } from '@/features/auth/OtpInput';
import { formatIndianMobile } from '@/features/auth/phone';
import { useSessionStore } from '@/features/auth/sessionStore';
import { useAddressStore } from '@/features/location/addressStore';
import { colors, fontSize, fontWeight, space, touch } from '@/theme/tokens';
import { Button } from '@/ui/Button';

const RESEND_SECONDS = 30;
const AUTO_READ_DELAY_MS = 2000;

export default function OtpScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const phone = params.phone ?? '';
  const [requestId, setRequestId] = useState(params.requestId ?? '');
  const logIn = useSessionStore((s) => s.logIn);
  const locationDone = useAddressStore((s) => s.locationStepDone);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('waiting');
  const [autoRead, setAutoRead] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const codeRef = useRef('');
  const alive = useRef(true);

  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );

  const verify = useCallback(
    async (value) => {
      setStatus('verifying');
      const ok = await verifyOtp(requestId, value);
      if (!alive.current) return;
      if (!ok) {
        setStatus('wrong');
        return;
      }
      logIn(phone);
      router.dismissAll();
      router.replace(locationDone ? '/' : '/location');
    },
    [requestId, phone, logIn, locationDone],
  );

  const updateCode = useCallback(
    (next) => {
      codeRef.current = next;
      setCode(next);
      if (next.length === OTP_LENGTH) void verify(next);
      else setStatus('waiting');
    },
    [verify],
  );

  // Simulates Android's SMS Retriever: the code arrives and fills itself in.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (codeRef.current.length > 0) return;
      setAutoRead(true);
      updateCode(DEMO_OTP);
    }, AUTO_READ_DELAY_MS);
    return () => clearTimeout(timer);
  }, [requestId, updateCode]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const onResend = async () => {
    updateCode('');
    setAutoRead(false);
    setSecondsLeft(RESEND_SECONDS);
    const res = await requestOtp(phone);
    if (alive.current) setRequestId(res.requestId);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.lg }]}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back to phone number"
        style={styles.back}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={24} color={colors.inkPrimary} />
      </Pressable>

      <Text style={styles.title} accessibilityRole="header">
        Verify your number
      </Text>
      <Text style={styles.body}>
        Enter the 6-digit code sent to <Text style={styles.phone}>{formatIndianMobile(phone)}</Text>
      </Text>
      <Button variant="text" label="Change number" onPress={() => router.back()} style={styles.inlineButton} />

      <OtpInput value={code} onChange={updateCode} error={status === 'wrong'} disabled={status === 'verifying'} />

      <View style={styles.statusRow} accessibilityLiveRegion="polite">
        <StatusLine status={status} autoRead={autoRead} />
      </View>

      {secondsLeft > 0 ? (
        <Text style={styles.resendWait}>Resend code in 0:{String(secondsLeft).padStart(2, '0')}</Text>
      ) : (
        <Button variant="text" label="Resend code" onPress={onResend} style={styles.inlineButton} />
      )}

      <Text style={styles.demoNote}>
        Prototype: no SMS is sent. The code fills itself after 2 s, like Android’s SMS auto-read.
      </Text>
    </View>
  );
}

function StatusLine({ status, autoRead }) {
  if (status === 'verifying') {
    return (
      <>
        {autoRead ? (
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
        ) : (
          <ActivityIndicator size="small" color={colors.brandOrangeStrong} />
        )}
        <Text style={[styles.statusText, autoRead && { color: colors.success }]}>
          {autoRead ? 'Code read from SMS — verifying…' : 'Verifying…'}
        </Text>
      </>
    );
  }
  if (status === 'wrong') {
    return (
      <Text style={[styles.statusText, { color: colors.danger }]}>That code doesn’t match. Please try again.</Text>
    );
  }
  return <Text style={styles.statusText}>Waiting for the SMS — we’ll fill the code for you.</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.brandCream, paddingHorizontal: space.lg, gap: space.md },
  back: { width: touch.min, height: touch.min, justifyContent: 'center' },
  title: { fontSize: fontSize.display, fontWeight: fontWeight.bold, color: colors.inkPrimary },
  body: { fontSize: fontSize.bodyLg, color: colors.inkSecondary, lineHeight: 22 },
  phone: { color: colors.inkPrimary, fontWeight: fontWeight.bold },
  inlineButton: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 24 },
  statusText: { fontSize: fontSize.body, color: colors.inkSecondary },
  resendWait: { fontSize: fontSize.body, color: colors.inkSecondary },
  demoNote: { fontSize: fontSize.caption, color: colors.inkSecondary, marginTop: 'auto' },
});
