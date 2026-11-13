import { Ionicons } from '@expo/vector-icons';

import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, space } from '@/theme/tokens';

/** Simple screen for tabs that are built in later milestones. */
export function PlaceholderScreen({ title, icon, message, children }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.lg }]}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.body}>
        <Ionicons name={icon} size={48} color={colors.brandOrangeStrong} />
        <Text style={styles.message}>{message}</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfacePage, paddingHorizontal: space.lg },
  title: { fontSize: fontSize.display, fontWeight: fontWeight.bold, color: colors.inkPrimary },
  body: { flex: 1, alignItems: 'stretch', justifyContent: 'center', gap: space.lg },
  message: { fontSize: fontSize.bodyLg, color: colors.inkSecondary, textAlign: 'center', lineHeight: 22 },
});
