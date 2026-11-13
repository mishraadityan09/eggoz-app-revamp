import { FlashList } from '@shopify/flash-list';
import { memo, useCallback, useMemo } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { colors, fontSize, fontWeight, radius, space } from '@/theme/tokens';
import { HeroCarousel } from './HeroCarousel';
import { CARD_GAP, CARD_H, CAROUSEL_H, SECTION_TITLE_H, SIDE } from './layout';
import { ProductCard } from './ProductCard';

function buildItems(data, isLoadTest) {
  const items = [];
  if (data.banners.length > 0) items.push({ type: 'carousel', key: 'carousel', banners: data.banners });
  if (isLoadTest) {
    const total = Object.keys(data.productsById).length;
    items.push({
      type: 'notice',
      key: 'notice',
      text: `Load test: ${total} synthetic products in ${data.sections.length} rows, generated from Eggoz’s 8 real products.`,
    });
  }
  for (const section of data.sections) {
    items.push({ type: 'title', key: `${section.id}-title`, title: section.title, count: section.products.length });
    items.push({ type: 'rail', key: `${section.id}-rail`, products: section.products });
  }
  return items;
}

const renderProduct = ({ item }) => <ProductCard product={item} />;
const productKey = (p) => p.id;
const RailSeparator = () => <View style={styles.railGap} />;

const Rail = memo(function Rail({ products }) {
  return (
    <FlashList
      horizontal
      data={products}
      renderItem={renderProduct}
      keyExtractor={productKey}
      ItemSeparatorComponent={RailSeparator}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.railContent}
      style={styles.rail}
    />
  );
});

const itemKey = (item) => item.key;
const itemType = (item) => item.type;
const VIEWABILITY = { itemVisiblePercentThreshold: 30 };

function HomeFeedImpl({ data, isLoadTest, refreshing, onRefresh }) {
  const items = useMemo(() => buildItems(data, isLoadTest), [data, isLoadTest]);
  // Written from the viewability callback, read by the carousel's auto-play: no re-render.
  const carouselVisible = useSharedValue(true);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      carouselVisible.set(viewableItems.some((v) => v.item?.type === 'carousel'));
    },
    [carouselVisible],
  );

  const renderItem = useCallback(
    ({ item }) => {
      switch (item.type) {
        case 'carousel':
          return (
            <View style={styles.carouselWrap}>
              <HeroCarousel banners={item.banners} visible={carouselVisible} />
            </View>
          );
        case 'notice':
          return <Text style={styles.notice}>{item.text}</Text>;
        case 'title':
          return (
            <View style={styles.titleRow}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {item.title}
              </Text>
              <Text style={styles.sectionCount}>{item.count} items</Text>
            </View>
          );
        case 'rail':
          // Keyed per section so a recycled row never keeps another row's scroll position.
          return <Rail key={item.key} products={item.products} />;
      }
    },
    [carouselVisible],
  );

  return (
    <FlashList
      data={items}
      renderItem={renderItem}
      keyExtractor={itemKey}
      getItemType={itemType}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={VIEWABILITY}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brandOrangeStrong]} />
      }
    />
  );
}

export const HomeFeed = memo(HomeFeedImpl);

const styles = StyleSheet.create({
  content: { paddingBottom: space.xxl },
  carouselWrap: { height: CAROUSEL_H, paddingTop: space.lg },
  notice: {
    marginHorizontal: SIDE,
    marginTop: space.sm,
    padding: space.md,
    borderRadius: radius.card,
    backgroundColor: colors.rewardBg,
    color: colors.rewardInk,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
  },
  titleRow: {
    height: SECTION_TITLE_H,
    paddingHorizontal: SIDE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: colors.inkPrimary },
  sectionCount: { fontSize: fontSize.caption, color: colors.inkSecondary },
  rail: { height: CARD_H },
  railContent: { paddingHorizontal: SIDE },
  railGap: { width: CARD_GAP },
});
