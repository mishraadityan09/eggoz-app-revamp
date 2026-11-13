import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { asyncJSONStorage } from '@/lib/persistedStore';

/** Saved schedules. Works for guests — login is only asked at checkout (finding U3). */

export const useSubscriptionStore = create()(
  persist(
    (set) => ({
      schedules: {},
      save: (s) => set((st) => ({ schedules: { ...st.schedules, [s.productId]: s } })),
      cancel: (id) =>
        set((st) => {
          const next = { ...st.schedules };
          delete next[id];
          return { schedules: next };
        }),
    }),
    { name: 'eggoz-concept-schedules', storage: asyncJSONStorage },
  ),
);

/** Which product's schedule sheet is open (not persisted). */

export const useScheduleSheet = create()((set) => ({
  productId: null,
  open: (productId) => set({ productId }),
  close: () => set({ productId: null }),
}));
