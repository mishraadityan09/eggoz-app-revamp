import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAddressStore } from '@/features/location/addressStore';
import { colors, fontSize, fontWeight, radius, space, touch } from '@/theme/tokens';

const openAddress = () => router.push({ pathname: '/location', params: { mode: 'change' } });
const openSearch = () => router.push('/search');

function HomeHeaderImpl({ coins, wallet }) {
  const insets = useSafeAreaInsets();
  const address = useAddressStore((s) => s.address);

  return (
    <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
      <View style={styles.topRow}>
        {/* Finding U4: the delivery address is always visible and one tap to change. */}
        <Pressable
          onPress={openAddress}
          accessibilityRole="button"
          accessibilityLabel={address ? `Delivering to ${address.label}. Change address` : 'Select a delivery location'}
          style={styles.addressChip}
        >
          <Ionicons name="location" size={22} color={colors.inkPrimary} />
          <View style={styles.addressText}>
            <Text style={styles.caption}>{address ? 'Delivering to' : 'No location set'}</Text>
            <View style={styles.addressRow}>
              <Text numberOfLines={1} style={styles.addressLabel}>
                {address ? address.label : 'Select delivery location'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.inkPrimary} />
            </View>
          </View>
        </Pressable>

        {/* Finding U9: labelled, fixed-size badges — no pop-in, no guessing. */}
        <View style={styles.pill} accessible accessibilityLabel={`${coins ?? 0} Eggoz coins`}>
          <Ionicons name="disc" size={14} color={colors.rewardInk} />
          <Text style={styles.pillText}>{coins ?? '–'} coins</Text>
        </View>
        <View style={styles.pill} accessible accessibilityLabel={`Wallet balance ${wallet ?? 0} rupees`}>
          <Ionicons name="wallet-outline" size={14} color={colors.rewardInk} />
          <Text style={styles.pillText}>₹{wallet ?? '–'}</Text>
        </View>
      </View>

      <Text style={styles.promise}>Order by midnight · delivered before sunrise</Text>

      <Pressable
        onPress={openSearch}
        accessibilityRole="search"
        accessibilityLabel="Search products"
        style={styles.search}
      >
        <Ionicons name="search" size={18} color={colors.inkSecondary} />
        <Text style={styles.searchText}>Search for brown eggs</Text>
      </Pressable>
    </View>
  );
}

export const HomeHeader = memo(HomeHeaderImpl);

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.brandHeader,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    gap: space.sm,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  addressChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: touch.min },
  addressText: { flex: 1 },
  caption: { fontSize: fontSize.caption, color: colors.headerInkMuted, fontWeight: fontWeight.semibold },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  addressLabel: { flexShrink: 1, fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, color: colors.inkPrimary },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minWidth: 64,
    height: 32,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.rewardBg,
    justifyContent: 'center',
  },
  pillText: { fontSize: fontSize.caption, fontWeight: fontWeight.bold, color: colors.rewardInk },
  promise: { fontSize: fontSize.caption, color: colors.headerInkMuted, fontWeight: fontWeight.semibold },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: touch.min,
    paddingHorizontal: space.md,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceCard,
  },
  searchText: { fontSize: fontSize.body, color: colors.inkPlaceholder },
});
