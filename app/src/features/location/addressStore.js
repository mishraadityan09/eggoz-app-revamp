import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { asyncJSONStorage } from '@/lib/persistedStore';

export const useAddressStore = create()(
  persist(
    (set) => ({
      address: null,
      locationStepDone: false,
      setAddress: (address) => set({ address, locationStepDone: true }),
      browseWithoutLocation: () => set({ locationStepDone: true }),
      reset: () => set({ address: null, locationStepDone: false }),
    }),
    {
      name: 'eggoz-concept-address',
      storage: asyncJSONStorage,
      partialize: ({ address, locationStepDone }) => ({ address, locationStepDone }),
    },
  ),
);
