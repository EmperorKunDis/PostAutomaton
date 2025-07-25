import { api } from './api';
import {
  GenerateSocialPostsRequest,
  GenerateSocialPostsResponse,
  SocialMediaContentPlan,
  SocialMediaPost,
  UpdateSocialPostRequest,
  RegenerateSocialPostRequest
} from '@internal-marketing-content-app/shared';

export const socialMediaService = {
  async generateSocialPosts(request: GenerateSocialPostsRequest): Promise<GenerateSocialPostsResponse> {
    const response = await api.post<GenerateSocialPostsResponse>('/social-media/generate', request);
    return response.data;
  },

  async getContentPlans(companyId?: string): Promise<SocialMediaContentPlan[]> {
    const params = companyId ? { companyId } : {};
    const response = await api.get<SocialMediaContentPlan[]>('/social-media/content-plans', { params });
    return response.data;
  },

  async getContentPlan(id: string): Promise<SocialMediaContentPlan> {
    const response = await api.get<SocialMediaContentPlan>(`/social-media/content-plans/${id}`);
    return response.data;
  },

  async updateSocialPost(postId: string, request: UpdateSocialPostRequest): Promise<SocialMediaPost> {
    const response = await api.put<SocialMediaPost>(`/social-media/posts/${postId}`, request);
    return response.data;
  },

  async regenerateSocialPost(postId: string, request: RegenerateSocialPostRequest): Promise<SocialMediaPost> {
    const response = await api.post<SocialMediaPost>(`/social-media/posts/${postId}/regenerate`, request);
    return response.data;
  },

  async deleteSocialPost(postId: string): Promise<void> {
    await api.delete(`/social-media/posts/${postId}`);
  }
};