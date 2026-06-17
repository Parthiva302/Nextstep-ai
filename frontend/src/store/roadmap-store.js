// frontend/src/store/roadmap-store.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useRoadmapStore = create(
  persist(
    (set) => ({
      learningRoadmap: null,
      setLearningRoadmap: (learningRoadmap) => set({ learningRoadmap }),
      clearRoadmap: () => set({ learningRoadmap: null })
    }),
    {
      name: 'nextstep-roadmap-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
