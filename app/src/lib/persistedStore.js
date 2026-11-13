import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { createJSONStorage } from 'zustand/middleware';

export const asyncJSONStorage = createJSONStorage(() => AsyncStorage);

/** True once every given persisted zustand store has loaded from storage. */
export function useHydrated(stores) {
  return useSyncExternalStore(
    (onChange) => {
      const unsubs = stores.map((s) => s.persist.onFinishHydration(onChange));
      return () => unsubs.forEach((u) => u());
    },
    () => stores.every((s) => s.persist.hasHydrated()),
  );
}
