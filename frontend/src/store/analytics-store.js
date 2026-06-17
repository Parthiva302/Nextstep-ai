// frontend/src/store/analytics-store.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAnalyticsStore = create(
  persist(
    (set) => ({
      githubData: null,
      githubRepos: null,
      leetcodeData: null,
      setGithubData: (githubData) => set({ githubData }),
      setGithubRepos: (githubRepos) => set({ githubRepos }),
      setLeetcodeData: (leetcodeData) => set({ leetcodeData }),
      clearAnalytics: () => set({ githubData: null, githubRepos: null, leetcodeData: null })
    }),
    {
      name: 'nextstep-analytics-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
