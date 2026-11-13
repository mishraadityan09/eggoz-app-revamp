import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, Switch, Text, View } from 'react-native';

import { formatIndianMobile } from '@/features/auth/phone';
import { useSessionStore } from '@/features/auth/sessionStore';
import { useCartStore } from '@/features/cart/cartStore';
import { useDemoStore } from '@/features/demo/demoStore';
import { useAddressStore } from '@/features/location/addressStore';
import { queryClient, queryPersister } from '@/lib/queryClient';
import { border, colors, fontSize, fontWeight, radius, space } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { PlaceholderScreen } from '@/ui/PlaceholderScreen';

const PORTFOLIO_URL = 'https://adityan-phi.vercel.app/en';

/** Drops cached products and photos (keeps login + address) to demo a true first load. */
async function clearCachedData() {
  queryClient.clear();
  await queryPersister.removeClient();
  await Promise.all([Image.clearDiskCache(), Image.clearMemoryCache()]);
}

/** Clears everything so the first-run flow (welcome → location → home) can be demoed again. */
async function resetDemo() {
  useSessionStore.getState().reset();
  useAddressStore.getState().reset();
  useCartStore.getState().clear();
  await clearCachedData();
  router.replace('/welcome');
}

export default function ProfileScreen() {
  const status = useSessionStore((s) => s.status);
  const phone = useSessionStore((s) => s.phone);
  const who = status === 'loggedIn' && phone ? `Logged in as ${formatIndianMobile(phone)}` : 'Browsing as a guest';
  const [cacheCleared, setCacheCleared] = useState(false);
  const dataset = useDemoStore((s) => s.dataset);
  const setDataset = useDemoStore((s) => s.setDataset);
  const onClearCache = async () => {
    await clearCachedData();
    setCacheCleared(true);
  };

  return (
    <PlaceholderScreen title="Profile" icon="person-circle-outline" message={who}>
      <Text style={styles.about}>
        Eggoz — concept redesign. An unofficial prototype by Adityan, not affiliated with Eggoz.
      </Text>
      <Button
        variant="secondary"
        icon="open-outline"
        label="About the designer"
        onPress={() => void Linking.openURL(PORTFOLIO_URL)}
      />
      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={styles.switchTitle}>Load test: ~480 products</Text>
          <Text style={styles.about}>Synthetic catalog built from the 8 real products, each with its own photo.</Text>
        </View>
        <Switch
          value={dataset === 'xl'}
          onValueChange={(on) => setDataset(on ? 'xl' : 'real')}
          trackColor={{ true: colors.brandOrangeStrong, false: colors.borderStrong }}
          accessibilityLabel="Load test with about 480 products"
        />
      </View>
      <Button
        variant="text"
        icon={cacheCleared ? 'checkmark' : 'trash-outline'}
        label={cacheCleared ? 'Cache cleared — restart the app for a first load' : 'Clear cached data (keep login)'}
        onPress={() => void onClearCache()}
        disabled={cacheCleared}
      />
      <Button variant="text" icon="refresh" label="Reset demo (start from welcome)" onPress={() => void resetDemo()} />
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  about: { fontSize: fontSize.caption, color: colors.inkSecondary, textAlign: 'center' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceCard,
    borderWidth: border.hairline,
    borderColor: colors.border,
  },
  switchText: { flex: 1, gap: 2 },
  switchTitle: { fontSize: fontSize.body, fontWeight: fontWeight.bold, color: colors.inkPrimary },
});
