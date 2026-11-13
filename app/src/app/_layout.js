import { Ionicons } from '@expo/vector-icons';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { prefetchHome } from '@/api/queries';
import { useSessionStore } from '@/features/auth/sessionStore';
import { useCartStore } from '@/features/cart/cartStore';
import { useDemoStore } from '@/features/demo/demoStore';
import { useAddressStore } from '@/features/location/addressStore';
import { useSubscriptionStore } from '@/features/subscribe/subscriptionStore';
import { useHydrated } from '@/lib/persistedStore';
import { CACHE_MAX_AGE, queryClient, queryPersister } from '@/lib/queryClient';
import { hideSplash, holdSplash } from '@/lib/splash';
import { colors } from '@/theme/tokens';

holdSplash();

const PERSISTED_STORES = [useSessionStore, useAddressStore, useCartStore, useDemoStore, useSubscriptionStore];
// Bump `buster` whenever the shape of cached data changes, so an old cache is discarded
// instead of being restored into screens that expect the new shape.
const persistOptions = { persister: queryPersister, maxAge: CACHE_MAX_AGE, buster: 'home-v2-cdn' };
const SPLASH_SAFETY_TIMEOUT_MS = 4000;

export default function RootLayout() {
  const storesReady = useHydrated(PERSISTED_STORES);
  const [cacheRestored, setCacheRestored] = useState(false);
  const [fontsLoaded, fontError] = useFonts(Ionicons.font);
  const ready = storesReady && cacheRestored && (fontsLoaded || fontError !== null);

  // Safety net: never keep the splash up longer than this, whatever happens.
  useEffect(() => {
    const timer = setTimeout(hideSplash, SPLASH_SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const onCacheRestored = useCallback(() => {
    setCacheRestored(true);
    // Start loading home while the user is still on onboarding screens (P2).
    void prefetchHome();
  }, []);
  const onCacheRestoreFailed = useCallback(() => setCacheRestored(true), []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={persistOptions}
          onSuccess={onCacheRestored}
          onError={onCacheRestoreFailed}
        >
          <StatusBar style="dark" />
          {ready ? (
            <Stack screenOptions={screenOptions}>
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
              <Stack.Screen name="otp" />
              <Stack.Screen name="location" options={{ animation: 'fade_from_bottom' }} />
              <Stack.Screen name="product/[id]" />
            </Stack>
          ) : null}
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.surfacePage },
};

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.brandCream } });
