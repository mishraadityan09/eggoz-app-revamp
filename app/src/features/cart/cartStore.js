import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { asyncJSONStorage } from '@/lib/persistedStore';

/** Guest cart (finding U3): works without login, persisted on the device. */

export const useCartStore = create()(
  persist(
    (set) => ({
      quantities: {},
      add: (id) => set((s) => ({ quantities: { ...s.quantities, [id]: (s.quantities[id] ?? 0) + 1 } })),
      remove: (id) =>
        set((s) => {
          const next = { ...s.quantities };
          const qty = (next[id] ?? 0) - 1;
          if (qty > 0) next[id] = qty;
          else delete next[id];
          return { quantities: next };
        }),
      clear: () => set({ quantities: {} }),
    }),
    { name: 'eggoz-concept-cart', storage: asyncJSONStorage },
  ),
);

export const selectItemCount = (s) => Object.values(s.quantities).reduce((sum, q) => sum + q, 0);
