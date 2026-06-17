// frontend/src/store/career-store.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCareerStore = create(
  persist(
    (set) => ({
      careerMatches: [],
      selectedGoal: 'Software Engineer',
      setCareerMatches: (careerMatches) => set({ careerMatches }),
      setSelectedGoal: (selectedGoal) => set({ selectedGoal }),
      clearCareer: () => set({ careerMatches: [], selectedGoal: 'Software Engineer' })
    }),
    {
      name: 'nextstep-career-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
