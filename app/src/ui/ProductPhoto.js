import { Image } from 'expo-image';
import { memo } from 'react';

import { colors } from '@/theme/tokens';

/**
 * Display-sized WebP from the CDN, cached in memory + on disk. While it loads, a
 * 36-byte blurhash shows a blurred version instantly — never an empty grey box.
 */
function ProductPhotoImpl({ image, variant = 'thumb', size, radius = 0, recyclingKey, style }) {
  const v = image[variant];
  return (
    <Image
      source={{ uri: v.url, width: v.width, height: v.height }}
      placeholder={{ blurhash: image.blurhash }}
      placeholderContentFit="cover"
      contentFit="cover"
      transition={{ duration: 180, effect: 'cross-dissolve', skipOnCacheHit: 'all' }}
      cachePolicy="memory-disk"
      recyclingKey={recyclingKey}
      accessible={false}
      style={[{ width: size, height: size, borderRadius: radius, backgroundColor: colors.brandCream }, style]}
    />
  );
}

export const ProductPhoto = memo(ProductPhotoImpl);
