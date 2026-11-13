import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCartStore } from '@/features/cart/cartStore';
import { ScheduleButton } from '@/features/subscribe/ScheduleButton';
import { border, colors, fontSize, fontWeight, radius, space } from '@/theme/tokens';
import { ProductPhoto } from '@/ui/ProductPhoto';
import { CARD_H, CARD_IMAGE, CARD_PAD, CARD_ROW_GAP, CARD_W, ROW } from './layout';
import { Stepper } from './Stepper';

export function displayName(p) {
  return `${p.name} · ${p.packSize} pcs`; // pack size exactly once (finding U12)
}

function ProductCardImpl({ product }) {
  const qty = useCartStore((s) => s.quantities[product.id] ?? 0);
  const add = useCartStore((s) => s.add);
  const remove = useCartStore((s) => s.remove);
  const onAdd = useCallback(() => add(product.id), [add, product.id]);
  const onRemove = useCallback(() => remove(product.id), [remove, product.id]);
  const onOpen = useCallback(() => router.push(`/product/${product.id}`), [product.id]);

  const discount = product.mrp ? Math.round((1 - product.price / product.mrp) * 100) : null;
  const name = displayName(product);

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${name}, size ${product.eggSize}, ₹${product.price}${discount ? `, ${discount}% off` : ''}`}
      accessibilityHint="Opens product details"
      style={styles.card}
    >
      {/* The egg-size badge (M / L / XL) is printed in the product photo itself. */}
      <ProductPhoto image={product.image} size={CARD_IMAGE} radius={radius.chip} recyclingKey={product.id} />
      <Text numberOfLines={2} style={styles.name}>
        {product.name}
      </Text>
      {/* Pack size gets its own line so a long name can never truncate it away. */}
      <Text style={styles.perEgg}>
        {product.packSize} eggs · ₹{product.pricePerEgg.toFixed(2)} / egg
      </Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>₹{product.price}</Text>
        {product.mrp ? <Text style={styles.mrp}>₹{product.mrp}</Text> : null}
        {discount ? <Text style={styles.off}>{discount}% off</Text> : null}
      </View>
      <View style={styles.earnRow}>
        {product.earnCoins ? <Text style={styles.earn}>Earn {product.earnCoins} coins</Text> : null}
      </View>
      <Stepper qty={qty} itemLabel={name} onAdd={onAdd} onRemove={onRemove} />
      <ScheduleButton productId={product.id} productName={name} height={ROW.schedule} />
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardImpl);

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    padding: CARD_PAD,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceCard,
    borderWidth: border.hairline,
    borderColor: colors.border,
    gap: CARD_ROW_GAP,
  },
  name: {
    height: ROW.name,
    fontSize: fontSize.body,
    lineHeight: 20,
    fontWeight: fontWeight.semibold,
    color: colors.inkPrimary,
  },
  perEgg: { height: ROW.perEgg, fontSize: fontSize.caption, color: colors.inkSecondary },
  priceRow: { height: ROW.price, flexDirection: 'row', alignItems: 'baseline', gap: space.xs },
  price: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, color: colors.inkPrimary },
  mrp: { fontSize: fontSize.caption, color: colors.inkSecondary, textDecorationLine: 'line-through' },
  off: { fontSize: fontSize.caption, fontWeight: fontWeight.bold, color: colors.discount },
  earnRow: { height: ROW.earn, justifyContent: 'center' },
  earn: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.rewardBg,
    color: colors.rewardInk,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
  },
});
