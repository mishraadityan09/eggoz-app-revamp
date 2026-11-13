import { useQuery } from '@tanstack/react-query';

import { useDemoStore } from '@/features/demo/demoStore';
import { queryClient } from '@/lib/queryClient';
import { fetchHome } from './remoteApi';

export const homeQueryKey = (dataset) => ['home', dataset];

export function useHomeQuery() {
  const dataset = useDemoStore((s) => s.dataset);
  return useQuery({ queryKey: homeQueryKey(dataset), queryFn: () => fetchHome(dataset) });
}

/** Warm the home cache while the user is still on onboarding screens (P2). */
export function prefetchHome() {
  const dataset = useDemoStore.getState().dataset;
  return queryClient.prefetchQuery({ queryKey: homeQueryKey(dataset), queryFn: () => fetchHome(dataset) });
}
