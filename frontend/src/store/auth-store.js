// frontend/src/store/auth-store.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      session: null,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      clearAuth: () => set({ user: null, session: null })
    }),
    {
      name: 'nextstep-auth-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
