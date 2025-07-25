import { create } from 'zustand';
import {
  SocialMediaContentPlan,
  SocialMediaPost,
  GenerateSocialPostsRequest,
  UpdateSocialPostRequest,
  RegenerateSocialPostRequest
} from '@internal-marketing-content-app/shared';
import { socialMediaService } from '../services/socialMediaService';

interface SocialMediaState {
  contentPlans: SocialMediaContentPlan[];
  currentContentPlan: SocialMediaContentPlan | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;

  // Actions
  generateSocialPosts: (request: GenerateSocialPostsRequest) => Promise<SocialMediaContentPlan>;
  getContentPlans: (companyId?: string) => Promise<void>;
  getContentPlan: (id: string) => Promise<void>;
  updateSocialPost: (postId: string, request: UpdateSocialPostRequest) => Promise<void>;
  regenerateSocialPost: (postId: string, request: RegenerateSocialPostRequest) => Promise<void>;
  deleteSocialPost: (postId: string) => Promise<void>;
  setCurrentContentPlan: (plan: SocialMediaContentPlan | null) => void;
  clearError: () => void;
}

export const useSocialMediaStore = create<SocialMediaState>((set, get) => ({
  contentPlans: [],
  currentContentPlan: null,
  isLoading: false,
  isGenerating: false,
  error: null,

  generateSocialPosts: async (request: GenerateSocialPostsRequest) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await socialMediaService.generateSocialPosts(request);
      const { contentPlan } = response;
      
      set((state) => ({
        contentPlans: [contentPlan, ...state.contentPlans],
        currentContentPlan: contentPlan,
        isGenerating: false
      }));
      
      return contentPlan;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate social posts';
      set({ error: errorMessage, isGenerating: false });
      throw error;
    }
  },

  getContentPlans: async (companyId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const plans = await socialMediaService.getContentPlans(companyId);
      set({ contentPlans: plans, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load content plans';
      set({ error: errorMessage, isLoading: false });
    }
  },

  getContentPlan: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const plan = await socialMediaService.getContentPlan(id);
      set({ currentContentPlan: plan, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load content plan';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateSocialPost: async (postId: string, request: UpdateSocialPostRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPost = await socialMediaService.updateSocialPost(postId, request);
      
      // Update the post in both currentContentPlan and contentPlans
      set((state) => {
        const updatePostInPlan = (plan: SocialMediaContentPlan): SocialMediaContentPlan => ({
          ...plan,
          posts: plan.posts.map(post => post.id === postId ? updatedPost : post)
        });

        return {
          currentContentPlan: state.currentContentPlan 
            ? updatePostInPlan(state.currentContentPlan)
            : null,
          contentPlans: state.contentPlans.map(plan => 
            plan.posts.some(p => p.id === postId) ? updatePostInPlan(plan) : plan
          ),
          isLoading: false
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update social post';
      set({ error: errorMessage, isLoading: false });
    }
  },

  regenerateSocialPost: async (postId: string, request: RegenerateSocialPostRequest) => {
    set({ isLoading: true, error: null });
    try {
      const regeneratedPost = await socialMediaService.regenerateSocialPost(postId, request);
      
      // Update the post in both currentContentPlan and contentPlans
      set((state) => {
        const updatePostInPlan = (plan: SocialMediaContentPlan): SocialMediaContentPlan => ({
          ...plan,
          posts: plan.posts.map(post => post.id === postId ? regeneratedPost : post)
        });

        return {
          currentContentPlan: state.currentContentPlan 
            ? updatePostInPlan(state.currentContentPlan)
            : null,
          contentPlans: state.contentPlans.map(plan => 
            plan.posts.some(p => p.id === postId) ? updatePostInPlan(plan) : plan
          ),
          isLoading: false
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate social post';
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteSocialPost: async (postId: string) => {
    set({ isLoading: true, error: null });
    try {
      await socialMediaService.deleteSocialPost(postId);
      
      // Remove the post from both currentContentPlan and contentPlans
      set((state) => {
        const removePostFromPlan = (plan: SocialMediaContentPlan): SocialMediaContentPlan => ({
          ...plan,
          posts: plan.posts.filter(post => post.id !== postId)
        });

        return {
          currentContentPlan: state.currentContentPlan 
            ? removePostFromPlan(state.currentContentPlan)
            : null,
          contentPlans: state.contentPlans.map(plan => 
            plan.posts.some(p => p.id === postId) ? removePostFromPlan(plan) : plan
          ),
          isLoading: false
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete social post';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setCurrentContentPlan: (plan: SocialMediaContentPlan | null) => {
    set({ currentContentPlan: plan });
  },

  clearError: () => {
    set({ error: null });
  }
}));