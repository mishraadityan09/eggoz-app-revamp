import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { asyncJSONStorage } from '@/lib/persistedStore';

export const useSessionStore = create()(
  persist(
    (set) => ({
      status: 'new',
      phone: null,
      continueAsGuest: () => set({ status: 'guest', phone: null }),
      logIn: (phone) => set({ status: 'loggedIn', phone }),
      reset: () => set({ status: 'new', phone: null }),
    }),
    {
      name: 'eggoz-concept-session',
      storage: asyncJSONStorage,
      partialize: ({ status, phone }) => ({ status, phone }),
    },
  ),
);
