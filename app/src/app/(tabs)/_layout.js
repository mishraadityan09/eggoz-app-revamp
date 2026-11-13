import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { useSessionStore } from '@/features/auth/sessionStore';
import { selectItemCount, useCartStore } from '@/features/cart/cartStore';
import { useAddressStore } from '@/features/location/addressStore';
import { ScheduleSheet } from '@/features/subscribe/ScheduleSheet';
import { colors, fontWeight } from '@/theme/tokens';

// The tab bar always passes the hex tint colours set below.
const iconColor = (c) => (typeof c === 'string' ? c : undefined);

function icon(name) {
  function TabIcon({ color, size }) {
    return <Ionicons name={name} size={size} color={iconColor(color)} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const status = useSessionStore((s) => s.status);
  const locationDone = useAddressStore((s) => s.locationStepDone);
  const cartCount = useCartStore(selectItemCount);

  // First run: welcome → location → home. Returning users land straight on home.
  if (status === 'new') return <Redirect href="/welcome" />;
  if (!locationDone) return <Redirect href="/location" />;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.brandOrangeStrong,
          tabBarInactiveTintColor: colors.inkSecondary,
          tabBarLabelStyle: { fontWeight: fontWeight.semibold },
          tabBarStyle: { backgroundColor: colors.surfaceCard, borderTopColor: colors.border },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
        <Tabs.Screen name="search" options={{ title: 'Search', tabBarIcon: icon('search') }} />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: icon('cart'),
            tabBarBadge: cartCount > 0 ? cartCount : undefined,
            tabBarBadgeStyle: { backgroundColor: colors.brandOrangeStrong, color: colors.inkOnPrimary },
          }}
        />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person') }} />
      </Tabs>
      <ScheduleSheet />
    </>
  );
}
