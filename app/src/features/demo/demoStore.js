import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { asyncJSONStorage } from '@/lib/persistedStore';

/**
 * 'real'  — Eggoz's actual 8 products (prices observed in their app).
 * 'xl'    — load test: ~480 synthetic products generated from those 8, each with
 *           its own photo URL, to show the app stays smooth with far more data.
 */

export const useDemoStore = create()(
  persist(
    (set) => ({
      dataset: 'real',
      setDataset: (dataset) => set({ dataset }),
    }),
    { name: 'eggoz-concept-demo', storage: asyncJSONStorage },
  ),
);
