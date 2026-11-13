import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, space } from '@/theme/tokens';

const PROPS = [
  { icon: 'calendar-outline', title: 'Daily subscription', text: 'Skip or pause any day' },
  { icon: 'sunny-outline', title: 'Before sunrise', text: 'Order by midnight' },
  { icon: 'gift-outline', title: 'Coins on orders', text: 'Use them like cash' },
];

export function ValueProps() {
  return (
    <View style={styles.row}>
      {PROPS.map((p) => (
        <View key={p.title} style={styles.item} accessible accessibilityLabel={`${p.title}. ${p.text}`}>
          <Ionicons name={p.icon} size={22} color={colors.brandOrangeStrong} />
          <Text style={styles.title}>{p.title}</Text>
          <Text style={styles.text}>{p.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  title: { fontSize: fontSize.caption, fontWeight: fontWeight.bold, color: colors.inkPrimary, textAlign: 'center' },
  text: { fontSize: fontSize.caption, color: colors.inkSecondary, textAlign: 'center' },
});
