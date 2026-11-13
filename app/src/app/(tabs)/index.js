import { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useHomeQuery } from '@/api/queries';
import { useDemoStore } from '@/features/demo/demoStore';
import { HomeFeed } from '@/features/home/HomeFeed';
import { HomeHeader } from '@/features/home/HomeHeader';
import { HomeSkeleton } from '@/features/home/HomeSkeleton';
import { hideSplash } from '@/lib/splash';
import { colors, fontSize, space } from '@/theme/tokens';
import { Button } from '@/ui/Button';

export default function HomeScreen() {
  const { data, isError, refetch, isRefetching } = useHomeQuery();
  const isLoadTest = useDemoStore((s) => s.dataset === 'xl');

  // Cached content or an exact-size skeleton is on screen — safe to drop the splash.
  useEffect(hideSplash, []);

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <View style={styles.screen}>
      <HomeHeader coins={data?.coins} wallet={data?.walletBalance} />
      {data ? (
        <HomeFeed data={data} isLoadTest={isLoadTest} refreshing={isRefetching} onRefresh={onRefresh} />
      ) : isError ? (
        <View style={styles.error}>
          <Text style={styles.errorText}>We couldn’t load products. Check your connection.</Text>
          <Button label="Try again" onPress={onRefresh} />
        </View>
      ) : (
        <HomeSkeleton />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfacePage },
  error: { flex: 1, justifyContent: 'center', padding: space.xl, gap: space.lg },
  errorText: { fontSize: fontSize.bodyLg, color: colors.inkPrimary, textAlign: 'center' },
});
