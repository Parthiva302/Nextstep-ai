// frontend/src/store/profile-store.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useProfileStore = create(
  persist(
    (set) => ({
      profile: null,
      uploadedResume: null,
      resumeAnalysis: null,
      setProfile: (profile) => set({ profile }),
      setUploadedResume: (uploadedResume) => set({ uploadedResume }),
      setResumeAnalysis: (resumeAnalysis) => set({ resumeAnalysis }),
      clearProfile: () => set({ profile: null, uploadedResume: null, resumeAnalysis: null })
    }),
    {
      name: 'nextstep-profile-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
