import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { border, colors, fontSize, fontWeight, radius, space, touch } from '@/theme/tokens';
import { Button } from '@/ui/Button';

export function Hero({ icon, title, body }) {
  return (
    <View style={styles.hero}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={40} color={colors.brandOrangeStrong} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

export function Locating({ onUsePincode }) {
  return (
    <View style={styles.block}>
      <View style={styles.locatingRow} accessibilityLiveRegion="polite">
        <ActivityIndicator color={colors.brandOrangeStrong} />
        <Text style={styles.locatingText}>Finding your location…</Text>
      </View>
      <Text style={styles.caption}>This usually takes a few seconds.</Text>
      <Button variant="text" label="Enter pincode instead" onPress={onUsePincode} />
    </View>
  );
}

const PROBLEM_COPY = {
  denied: {
    title: 'Location permission is off',
    body: 'No problem — enter your pincode and we’ll check delivery for you.',
  },
  blocked: {
    title: 'Location access is blocked',
    body: 'You can allow it in Settings, or simply use your pincode.',
  },
  servicesOff: {
    title: 'Your phone’s location is turned off',
    body: 'Turn it on, or enter your pincode instead — it is just as quick.',
  },
  timeout: {
    title: 'We couldn’t find your location',
    body: 'The GPS signal may be weak indoors. Enter your pincode instead.',
  },
  failed: {
    title: 'We couldn’t find your location',
    body: 'Something went wrong on the device. Enter your pincode instead.',
  },
};

export function problemCopy(reason) {
  return PROBLEM_COPY[reason];
}

export function ProblemActions({ reason, onPincode, onRetry, onTurnOn, onOpenSettings }) {
  if (reason === 'servicesOff') {
    return (
      <View style={styles.block}>
        <Button icon="navigate-outline" label="Turn on location" onPress={onTurnOn} />
        <Button variant="secondary" icon="keypad-outline" label="Enter pincode" onPress={onPincode} />
      </View>
    );
  }
  return (
    <View style={styles.block}>
      <Button icon="keypad-outline" label="Enter pincode" onPress={onPincode} />
      {reason === 'blocked' ? (
        <Button variant="secondary" icon="settings-outline" label="Open settings" onPress={onOpenSettings} />
      ) : (
        <Button variant="secondary" icon="refresh" label="Try again" onPress={onRetry} />
      )}
    </View>
  );
}

export function PincodeForm({ checking, error, onSubmit, onUseLocation }) {
  const [pin, setPin] = useState('');
  return (
    <View style={styles.block}>
      <TextInput
        value={pin}
        onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 6))}
        onSubmitEditing={() => onSubmit(pin)}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        autoComplete="postal-code"
        placeholder="6-digit pincode"
        placeholderTextColor={colors.inkPlaceholder}
        accessibilityLabel="Delivery pincode"
        style={[styles.pinInput, error ? styles.pinInputError : null]}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : (
        <Text style={styles.caption}>Prototype delivers to Gurugram (122…), Delhi (110…) and Noida (201…).</Text>
      )}
      <Button label="Check delivery" onPress={() => onSubmit(pin)} disabled={pin.length !== 6} loading={checking} />
      <Button variant="text" icon="locate-outline" label="Use my current location instead" onPress={onUseLocation} />
    </View>
  );
}

export function AddressCard({ address }) {
  return (
    <View
      style={styles.addressCard}
      accessible
      accessibilityLabel={`Deliver to ${address.label}, pincode ${address.pincode}. Next-morning delivery available.`}
    >
      <Ionicons name="location" size={24} color={colors.brandOrangeStrong} />
      <View style={styles.addressText}>
        <Text style={styles.addressLabel}>{address.label}</Text>
        {address.source === 'gps' ? (
          <Text style={styles.addressMeta}>Pincode {address.pincode} · from your current location</Text>
        ) : null}
        <View style={styles.okRow}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.okText}>Next-morning delivery available</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: space.md, paddingHorizontal: space.md },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: border.hairline,
    borderColor: colors.border,
  },
  title: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.inkPrimary, textAlign: 'center' },
  body: { fontSize: fontSize.bodyLg, color: colors.inkSecondary, textAlign: 'center', lineHeight: 22 },
  block: { gap: space.md },
  locatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: touch.min,
  },
  locatingText: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.semibold, color: colors.inkPrimary },
  caption: { fontSize: fontSize.caption, color: colors.inkSecondary, textAlign: 'center' },
  error: { fontSize: fontSize.caption, color: colors.danger, textAlign: 'center' },
  pinInput: {
    minHeight: touch.min + 8,
    borderWidth: border.control,
    borderColor: colors.borderStrong,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceCard,
    fontSize: 22,
    letterSpacing: 6,
    textAlign: 'center',
    color: colors.inkPrimary,
  },
  pinInputError: { borderColor: colors.danger },
  addressCard: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceCard,
    borderWidth: border.hairline,
    borderColor: colors.border,
  },
  addressText: { flex: 1, gap: 2 },
  addressLabel: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, color: colors.inkPrimary },
  addressMeta: { fontSize: fontSize.caption, color: colors.inkSecondary },
  okRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: space.xs },
  okText: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, color: colors.success },
});
