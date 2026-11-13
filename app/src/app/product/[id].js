import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHomeQuery } from '@/api/queries';
import { displayName } from '@/features/home/ProductCard';
import { colors, fontSize, fontWeight, radius, space, touch } from '@/theme/tokens';
import { ProductPhoto } from '@/ui/ProductPhoto';

const PHOTO = Dimensions.get('window').width - space.lg * 2;

/** Placeholder — the full product page (sticky bar, pack sizes, subscribe sheet) is Milestone 3. */
export default function ProductScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { data } = useHomeQuery();
  const product = id ? data?.productsById[id] : undefined;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.sm }]}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={styles.back}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={24} color={colors.inkPrimary} />
      </Pressable>
      {product ? <ProductPhoto image={product.image} variant="full" size={PHOTO} radius={radius.card} /> : null}
      <Text style={styles.title} accessibilityRole="header">
        {product ? displayName(product) : 'Product not found'}
      </Text>
      <Text style={styles.body}>The full product page arrives in Milestone 3.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfacePage, paddingHorizontal: space.lg, gap: space.md },
  back: { width: touch.min, height: touch.min, justifyContent: 'center' },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: colors.inkPrimary },
  body: { fontSize: fontSize.bodyLg, color: colors.inkSecondary },
});
