import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHomeQuery } from '@/api/queries';

import { Stepper } from '@/features/home/Stepper';
import { border, colors, fontSize, fontWeight, radius, space, touch } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { ProductPhoto } from '@/ui/ProductPhoto';
import { FREQUENCIES, pricing, startDates } from './schedule';
import { useScheduleSheet, useSubscriptionStore } from './subscriptionStore';

/** Mounted once; opened from any product card's "Schedule" button. */
export function ScheduleSheet() {
  const productId = useScheduleSheet((s) => s.productId);
  const close = useScheduleSheet((s) => s.close);
  const { data } = useHomeQuery();
  const product = productId ? data?.productsById[productId] : undefined;

  return (
    <Modal
      visible={!!product}
      transparent
      animationType="slide"
      onRequestClose={close}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={close}
        accessibilityLabel="Close schedule"
        accessibilityRole="button"
      />
      {product ? <SheetBody key={product.id} product={product} onClose={close} /> : null}
    </Modal>
  );
}

function SheetBody({ product, onClose }) {
  const insets = useSafeAreaInsets();
  const existing = useSubscriptionStore((s) => s.schedules[product.id]);
  const save = useSubscriptionStore((s) => s.save);
  const cancel = useSubscriptionStore((s) => s.cancel);
  const dates = useMemo(() => startDates(7), []);
  const [frequency, setFrequency] = useState(existing?.frequency ?? 'daily');
  const [packs, setPacks] = useState(existing?.packs ?? 1);
  const [startDate, setStartDate] = useState(existing?.startDate ?? dates[0]?.iso ?? '');
  const price = pricing(product.price, packs, frequency);

  const onSave = () => {
    const schedule = { productId: product.id, frequency, packs, startDate };
    save(schedule);
    onClose();
  };

  return (
    <View style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]} accessibilityViewIsModal>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Schedule deliveries
        </Text>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.close}
          hitSlop={8}
        >
          <Ionicons name="close" size={24} color={colors.inkPrimary} />
        </Pressable>
      </View>

      <View style={styles.productRow}>
        <ProductPhoto image={product.image} size={56} radius={radius.chip} />
        <View style={styles.flex}>
          <Text numberOfLines={2} style={styles.productName}>
            {product.name}
          </Text>
          <Text style={styles.muted}>
            {product.packSize} eggs · ₹{product.price} per pack
          </Text>
        </View>
      </View>

      <Text style={styles.label}>How often?</Text>
      <View style={styles.chips}>
        {FREQUENCIES.map((f) => (
          <Chip key={f.id} label={f.label} selected={frequency === f.id} onPress={() => setFrequency(f.id)} />
        ))}
      </View>

      <View style={styles.packsRow}>
        <Text style={styles.label}>Packs per delivery</Text>
        <View style={styles.stepper}>
          <Stepper
            qty={packs}
            itemLabel="pack"
            onAdd={() => setPacks((p) => Math.min(p + 1, 5))}
            onRemove={() => setPacks((p) => Math.max(p - 1, 1))}
          />
        </View>
      </View>

      <Text style={styles.label}>Start from</Text>
      <View style={styles.chips}>
        {dates.map((d) => (
          <Chip key={d.iso} label={d.label} selected={startDate === d.iso} onPress={() => setStartDate(d.iso)} />
        ))}
      </View>

      <View
        style={styles.summary}
        accessible
        accessibilityLabel={`₹${price.perDelivery} per delivery, you save ₹${price.savedPerDelivery}. About ₹${price.monthly} a month for ${price.deliveries} deliveries.`}
      >
        <View style={styles.flex}>
          <Text style={styles.summaryPrice}>
            ₹{price.perDelivery} <Text style={styles.muted}>per delivery</Text>
          </Text>
          <Text style={styles.saving}>You save ₹{price.savedPerDelivery} (5%) every delivery</Text>
        </View>
        <Text style={styles.muted}>
          ≈ ₹{price.monthly}/month{'\n'}
          {price.deliveries} deliveries
        </Text>
      </View>
      <Text style={styles.note}>Pause or skip any day. No login needed until checkout.</Text>

      <Button icon="calendar" label={existing ? 'Update schedule' : 'Start schedule'} onPress={onSave} />
      {existing ? (
        <Button
          variant="text"
          label="Cancel this schedule"
          onPress={() => {
            cancel(product.id);
            onClose();
          }}
        />
      ) : null}
    </View>
  );
}

function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: colors.inkPrimary },
  close: { width: touch.min, height: touch.min, alignItems: 'flex-end', justifyContent: 'center' },
  productRow: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  productName: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: colors.inkPrimary },
  muted: { fontSize: fontSize.caption, color: colors.inkSecondary, fontWeight: fontWeight.regular },
  label: { fontSize: fontSize.body, fontWeight: fontWeight.bold, color: colors.inkPrimary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minHeight: 40,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: border.control,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
  },
  chipSelected: { borderColor: colors.accentSubscribe, backgroundColor: colors.accentSubscribe },
  chipText: { fontSize: fontSize.body, color: colors.inkPrimary },
  chipTextSelected: { color: colors.inkOnPrimary, fontWeight: fontWeight.bold },
  packsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { width: 130 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.card,
    backgroundColor: colors.successBg,
  },
  summaryPrice: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: colors.inkPrimary },
  saving: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, color: colors.success },
  note: { fontSize: fontSize.caption, color: colors.inkSecondary },
});
