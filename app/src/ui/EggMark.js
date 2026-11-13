import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { border, colors } from '@/theme/tokens';

/** Simple egg illustration used until real (royalty-free) product images are added. */
function EggMarkImpl({ size }) {
  const height = size * 1.28;
  const yolk = size * 0.48;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.egg, { width: size, height, borderRadius: size / 2 }]}
    >
      <View style={[styles.yolk, { width: yolk, height: yolk, borderRadius: yolk / 2, marginTop: size * 0.22 }]} />
    </View>
  );
}

export const EggMark = memo(EggMarkImpl);

const styles = StyleSheet.create({
  egg: {
    backgroundColor: '#FFF8EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: border.hairline,
    borderColor: '#F1E4CC',
  },
  yolk: { backgroundColor: colors.brandYolk },
});
