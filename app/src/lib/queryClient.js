import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

const DAY_MS = 24 * 60 * 60 * 1000;

export const CACHE_MAX_AGE = DAY_MS;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: DAY_MS, // must be >= persister maxAge or restored data is dropped
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'eggoz-concept-query-cache',
  throttleTime: 1000,
});
