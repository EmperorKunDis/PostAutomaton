import { create } from 'zustand';
import { WriterProfile, WriterTone, WriterStyle } from '@internal-marketing-content-app/shared';
import { writerProfileService } from '../services/writerProfileService';

interface WriterProfileState {
  profiles: WriterProfile[];
  currentProfile: WriterProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProfiles: (params?: { companyId?: string; userId?: string; activeOnly?: boolean }) => Promise<void>;
  loadProfile: (id: string) => Promise<void>;
  generateProfiles: (companyId: string, userId: string, count?: number) => Promise<void>;
  createProfile: (profile: Omit<WriterProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProfile: (id: string, updates: Partial<WriterProfile>) => Promise<void>;
  updateSocialPlatforms: (id: string, platforms: string[]) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setCurrentProfile: (profile: WriterProfile | null) => void;
  clearError: () => void;
}

export const useWriterProfileStore = create<WriterProfileState>((set, get) => ({
  profiles: [],
  currentProfile: null,
  isLoading: false,
  error: null,

  loadProfiles: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const profiles = await writerProfileService.getProfiles(params);
      set({ profiles, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load profiles',
        isLoading: false 
      });
    }
  },

  loadProfile: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const profile = await writerProfileService.getProfile(id);
      set({ currentProfile: profile, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load profile',
        isLoading: false 
      });
    }
  },

  generateProfiles: async (companyId, userId, count = 3) => {
    try {
      set({ isLoading: true, error: null });
      const profiles = await writerProfileService.generateProfiles({
        companyId,
        count,
        includeCustomization: true
      });
      
      const existingProfiles = get().profiles;
      set({ 
        profiles: [...existingProfiles, ...profiles],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate profiles',
        isLoading: false 
      });
    }
  },

  createProfile: async (profileData) => {
    try {
      set({ isLoading: true, error: null });
      const profile = await writerProfileService.createProfile(profileData);
      
      const existingProfiles = get().profiles;
      set({ 
        profiles: [...existingProfiles, profile],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create profile',
        isLoading: false 
      });
    }
  },

  updateProfile: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      const updatedProfile = await writerProfileService.updateProfile(id, updates);
      
      const profiles = get().profiles.map(p => 
        p.id === id ? updatedProfile : p
      );
      
      set({ 
        profiles,
        currentProfile: get().currentProfile?.id === id ? updatedProfile : get().currentProfile,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update profile',
        isLoading: false 
      });
    }
  },

  updateSocialPlatforms: async (id, platforms) => {
    try {
      set({ isLoading: true, error: null });
      const updatedProfile = await writerProfileService.updateSocialPlatforms(id, platforms);
      
      const profiles = get().profiles.map(p => 
        p.id === id ? updatedProfile : p
      );
      
      set({ 
        profiles,
        currentProfile: get().currentProfile?.id === id ? updatedProfile : get().currentProfile,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update social platforms',
        isLoading: false 
      });
    }
  },

  deleteProfile: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await writerProfileService.deleteProfile(id);
      
      const profiles = get().profiles.filter(p => p.id !== id);
      const currentProfile = get().currentProfile?.id === id ? null : get().currentProfile;
      
      set({ 
        profiles,
        currentProfile,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete profile',
        isLoading: false 
      });
    }
  },

  setCurrentProfile: (profile) => {
    set({ currentProfile: profile });
  },

  clearError: () => {
    set({ error: null });
  }
}));