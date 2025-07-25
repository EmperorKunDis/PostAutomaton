import { 
  ContentTopic, 
  GenerateContentTopicsRequest, 
  GenerateContentTopicsResponse,
  UpdateContentTopicRequest,
  TopicCategory,
  DEFAULT_TOPIC_CATEGORIES
} from '@internal-marketing-content-app/shared';
import { api } from './api';

export const contentTopicsService = {
  // Generate content topics for a year
  generateTopics: async (request: GenerateContentTopicsRequest): Promise<GenerateContentTopicsResponse> => {
    const response = await api.post<GenerateContentTopicsResponse>('/content-topics/generate', request);
    return response.data;
  },

  // Get all content topics for a user (optionally filtered by company)
  getTopics: async (companyId?: string): Promise<ContentTopic[]> => {
    const params = companyId ? { companyId } : {};
    const response = await api.get<ContentTopic[]>('/content-topics', { params });
    return response.data;
  },

  // Get available topic categories
  getCategories: (): TopicCategory[] => {
    return DEFAULT_TOPIC_CATEGORIES;
  },

  // Get a specific content topic
  getTopic: async (topicId: string): Promise<ContentTopic> => {
    const response = await api.get<ContentTopic>(`/content-topics/${topicId}`);
    return response.data;
  },

  // Update a content topic
  updateTopic: async (topicId: string, updateData: UpdateContentTopicRequest): Promise<ContentTopic> => {
    const response = await api.put<ContentTopic>(`/content-topics/${topicId}`, updateData);
    return response.data;
  },

  // Delete a content topic
  deleteTopic: async (topicId: string): Promise<void> => {
    await api.delete(`/content-topics/${topicId}`);
  }
};