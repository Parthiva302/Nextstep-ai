// frontend/src/store/app-store.js
import { useAuthStore } from './auth-store';
import { useProfileStore } from './profile-store';
import { useAnalyticsStore } from './analytics-store';
import { useRoadmapStore } from './roadmap-store';
import { useCareerStore } from './career-store';

export {
  useAuthStore,
  useProfileStore,
  useAnalyticsStore,
  useRoadmapStore,
  useCareerStore
};

// Unified facade store for backward compatibility
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialPreferences = {
  theme: 'dark',
  sidebarOpen: true
};

const initialUserSettings = {
  githubUsername: '',
  leetcodeUsername: '',
  theme: 'dark'
};

export const useAppStore = create(
  persist(
    (set) => ({
      // State Variables
      uploadedResume: null,
      resumeAnalysis: null,
      githubData: null,
      githubRepos: null,
      leetcodeData: null,
      linkedinData: null,
      mentorMessages: null,
      learningRoadmap: null,
      dashboardPreferences: initialPreferences,
      userSettings: initialUserSettings,

      // Update Methods
      setUploadedResume: (uploadedResume) => set({ uploadedResume }),
      setResumeAnalysis: (resumeAnalysis) => set({ resumeAnalysis }),
      setGithubData: (githubData) => set({ githubData }),
      setGithubRepos: (githubRepos) => set({ githubRepos }),
      setLeetcodeData: (leetcodeData) => set({ leetcodeData }),
      setLinkedinData: (linkedinData) => set({ linkedinData }),
      setMentorMessages: (mentorMessages) => set({ mentorMessages }),
      setLearningRoadmap: (learningRoadmap) => set({ learningRoadmap }),
      updateDashboardPreferences: (prefs) =>
        set((state) => ({
          dashboardPreferences: { ...state.dashboardPreferences, ...prefs }
        })),
      updateUserSettings: (settings) =>
        set((state) => ({
          userSettings: { ...state.userSettings, ...settings }
        })),

      // Reset Methods
      resetStore: () =>
        set({
          uploadedResume: null,
          resumeAnalysis: null,
          githubData: null,
          githubRepos: null,
          leetcodeData: null,
          linkedinData: null,
          mentorMessages: null,
          learningRoadmap: null,
          dashboardPreferences: initialPreferences,
          userSettings: initialUserSettings
        }),

      clearCache: () =>
        set({
          githubData: null,
          githubRepos: null,
          leetcodeData: null,
          mentorMessages: null,
          learningRoadmap: null
        })
    }),
    {
      name: 'nextstep-app-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export const clearAllStores = () => {
  useAppStore.getState().resetStore();
  useAuthStore.getState().clearAuth();
  useProfileStore.getState().clearProfile();
  useAnalyticsStore.getState().clearAnalytics();
  useCareerStore.getState().clearCareer();
  useRoadmapStore.getState().clearRoadmap();

  localStorage.removeItem('nextstep-app-store');
  localStorage.removeItem('nextstep-auth-store');
  localStorage.removeItem('nextstep-profile-store');
  localStorage.removeItem('nextstep-analytics-store');
  localStorage.removeItem('nextstep-career-store');
  localStorage.removeItem('nextstep-roadmap-store');
};
