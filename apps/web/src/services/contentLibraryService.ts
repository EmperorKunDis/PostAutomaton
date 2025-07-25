import { apiClient } from './api';
import {
  ContentLibrarySearchRequest,
  ContentLibrarySearchResponse,
  CreateContentTagRequest,
  UpdateContentAssetRequest,
  CreateReusableSnippetRequest,
  UpdateReusableSnippetRequest,
  ContentAsset,
  ContentTag,
  ReusableSnippet,
  MediaAsset
} from '@internal-marketing-content-app/shared';

export class ContentLibraryService {
  async searchContentLibrary(searchRequest: ContentLibrarySearchRequest): Promise<ContentLibrarySearchResponse> {
    const response = await apiClient.post('/content-library/search', searchRequest);
    return response.data as ContentLibrarySearchResponse;
  }

  async createContentTag(request: CreateContentTagRequest, companyId: string): Promise<ContentTag> {
    const response = await apiClient.post(`/content-library/tags?companyId=${companyId}`, request);
    return response.data as ContentTag;
  }

  async updateContentAsset(assetId: string, request: Omit<UpdateContentAssetRequest, 'id'>): Promise<ContentAsset> {
    const response = await apiClient.put(`/content-library/assets/${assetId}`, request);
    return response.data as ContentAsset;
  }

  async createReusableSnippet(request: CreateReusableSnippetRequest, companyId: string): Promise<ReusableSnippet> {
    const response = await apiClient.post(`/content-library/snippets?companyId=${companyId}`, request);
    return response.data as ReusableSnippet;
  }

  async updateReusableSnippet(snippetId: string, request: Omit<UpdateReusableSnippetRequest, 'id'>): Promise<ReusableSnippet> {
    const response = await apiClient.put(`/content-library/snippets/${snippetId}`, request);
    return response.data as ReusableSnippet;
  }

  async trackAssetUsage(
    assetId: string,
    usedInType: 'blog_post' | 'social_post' | 'campaign',
    usedInId: string,
    platform?: string
  ): Promise<void> {
    await apiClient.post(`/content-library/assets/${assetId}/track-usage`, {
      usedInType,
      usedInId,
      platform
    });
  }

  async syncExistingContent(companyId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/content-library/sync?companyId=${companyId}`);
    return response.data as { message: string };
  }
}

export const contentLibraryService = new ContentLibraryService();