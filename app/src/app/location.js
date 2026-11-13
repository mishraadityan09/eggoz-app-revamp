import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAddressStore } from '@/features/location/addressStore';
import {
  AddressCard,
  Hero,
  Locating,
  PincodeForm,
  ProblemActions,
  problemCopy,
} from '@/features/location/LocationViews';
import { useLocationFlow } from '@/features/location/useLocationFlow';
import { hideSplash } from '@/lib/splash';
import { colors, fontSize, space, touch } from '@/theme/tokens';
import { Button } from '@/ui/Button';

export default function LocationScreen() {
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams();
  const changing = mode === 'change';
  const setAddress = useAddressStore((s) => s.setAddress);
  const browseWithoutLocation = useAddressStore((s) => s.browseWithoutLocation);
  const flow = useLocationFlow();
  const { state } = flow;
  const [notifyRequested, setNotifyRequested] = useState(false);

  useEffect(hideSplash, []);

  const leave = () => (changing ? router.back() : router.replace('/'));
  const confirm = (address) => {
    setAddress(address);
    leave();
  };
  const browse = () => {
    browseWithoutLocation();
    leave();
  };

  const browseButton = changing ? null : <Button variant="text" label="Browse without a location" onPress={browse} />;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.xl },
        ]}
      >
        <View style={styles.topBar}>
          {changing ? (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={styles.close}
              hitSlop={8}
            >
              <Ionicons name="close" size={26} color={colors.inkPrimary} />
            </Pressable>
          ) : (
            <Text style={styles.stepLabel}>Step 2 of 2 · Delivery location</Text>
          )}
        </View>

        {state.step === 'intro' || state.step === 'locating' ? (
          <>
            <Hero
              icon="location-outline"
              title={changing ? 'Change delivery location' : 'Where should we deliver?'}
              body="We use your location only to check that we deliver to your area — nothing else."
            />
            {state.step === 'locating' ? (
              <Locating onUsePincode={flow.showPincode} />
            ) : (
              <View style={styles.actions}>
                <Button icon="locate-outline" label="Use my current location" onPress={flow.locateMe} />
                <Button variant="secondary" icon="keypad-outline" label="Enter pincode" onPress={flow.showPincode} />
                {browseButton}
              </View>
            )}
          </>
        ) : null}

        {state.step === 'problem' ? (
          <>
            <Hero icon="alert-circle-outline" {...problemCopy(state.reason)} />
            <ProblemActions
              reason={state.reason}
              onPincode={flow.showPincode}
              onRetry={flow.locateMe}
              onTurnOn={flow.turnOnServicesAndRetry}
              onOpenSettings={flow.openAppSettings}
            />
            {browseButton}
          </>
        ) : null}

        {state.step === 'pincode' ? (
          <>
            <Hero
              icon="keypad-outline"
              title="Enter your delivery pincode"
              body="We’ll check delivery to your area instantly."
            />
            <PincodeForm
              checking={state.checking}
              error={state.error}
              onSubmit={flow.submitPincode}
              onUseLocation={flow.locateMe}
            />
            {browseButton}
          </>
        ) : null}

        {state.step === 'confirm' ? (
          <>
            <Hero
              icon="checkmark-circle-outline"
              title="Great, we deliver here!"
              body="Confirm your delivery area to see today’s prices."
            />
            <AddressCard address={state.address} />
            <View style={styles.actions}>
              <Button label="Confirm & continue" onPress={() => confirm(state.address)} />
              <Button variant="secondary" label="Change" onPress={flow.showPincode} />
            </View>
          </>
        ) : null}

        {state.step === 'notServiceable' ? (
          <>
            <Hero
              icon="map-outline"
              title={`We don’t deliver to ${state.place} yet`}
              body="We’re expanding fast. You can still browse products and prices."
            />
            <View style={styles.actions}>
              <Button icon="storefront-outline" label="Browse products" onPress={browse} />
              <Button variant="secondary" label="Try another pincode" onPress={flow.showPincode} />
              <Button
                variant="text"
                icon={notifyRequested ? 'checkmark' : 'notifications-outline'}
                label={notifyRequested ? 'We’ll let you know (demo)' : 'Notify me when you’re here'}
                onPress={() => setNotifyRequested(true)}
                disabled={notifyRequested}
              />
            </View>
          </>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.brandCream },
  content: { flexGrow: 1, paddingHorizontal: space.lg, gap: space.xl },
  topBar: { minHeight: touch.min, justifyContent: 'center' },
  close: { width: touch.min, height: touch.min, justifyContent: 'center' },
  stepLabel: { fontSize: fontSize.caption, color: colors.inkSecondary, fontWeight: '600' },
  actions: { gap: space.md },
});
