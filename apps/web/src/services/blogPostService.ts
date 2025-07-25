import { api } from './api';
import {
  BlogPost,
  GenerateBlogPostRequest,
  GenerateBlogPostResponse,
  UpdateBlogPostSectionRequest,
  UpdateBlogPostSectionResponse,
  BlogPostSection,
  RegenerateBlogPostSectionRequest,
  RegenerateBlogPostSectionResponse,
  DeleteBlogPostSectionResponse,
  ApproveBlogPostRequest
} from '@internal-marketing-content-app/shared';

export const blogPostService = {
  async generateBlogPost(request: GenerateBlogPostRequest): Promise<GenerateBlogPostResponse> {
    const response = await api.post<GenerateBlogPostResponse>('/blog-posts/generate', request);
    return response.data;
  },

  async getBlogPost(id: string): Promise<BlogPost> {
    const response = await api.get<BlogPost>(`/blog-posts/${id}`);
    return response.data;
  },

  async getBlogPosts(companyId?: string): Promise<BlogPost[]> {
    const params = companyId ? { companyId } : {};
    const response = await api.get<BlogPost[]>('/blog-posts', { params });
    return response.data;
  },

  async updateBlogPostSection(
    blogPostId: string,
    sectionId: string,
    request: UpdateBlogPostSectionRequest
  ): Promise<UpdateBlogPostSectionResponse> {
    const response = await api.put<UpdateBlogPostSectionResponse>(
      `/blog-posts/${blogPostId}/sections/${sectionId}`,
      request
    );
    return response.data;
  },

  async deleteBlogPost(id: string): Promise<void> {
    await api.delete(`/blog-posts/${id}`);
  },

  async regenerateSection(
    blogPostId: string,
    sectionId: string,
    request: RegenerateBlogPostSectionRequest
  ): Promise<RegenerateBlogPostSectionResponse> {
    const response = await api.post<RegenerateBlogPostSectionResponse>(
      `/blog-posts/${blogPostId}/sections/${sectionId}/regenerate`,
      request
    );
    return response.data;
  },

  async deleteSection(
    blogPostId: string,
    sectionId: string
  ): Promise<DeleteBlogPostSectionResponse> {
    const response = await api.delete<DeleteBlogPostSectionResponse>(
      `/blog-posts/${blogPostId}/sections/${sectionId}`
    );
    return response.data;
  },

  async approveBlogPost(
    blogPostId: string,
    request: ApproveBlogPostRequest
  ): Promise<BlogPost> {
    const response = await api.put<BlogPost>(
      `/blog-posts/${blogPostId}/approve`,
      request
    );
    return response.data;
  }
};