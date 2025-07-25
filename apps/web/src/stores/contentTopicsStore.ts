import { create } from 'zustand';
import { 
  ContentTopic, 
  GenerateContentTopicsRequest, 
  GenerateContentTopicsResponse,
  UpdateContentTopicRequest,
  TopicCategory 
} from '@internal-marketing-content-app/shared';
import { contentTopicsService } from '../services/contentTopicsService';

interface ContentTopicsState {
  topics: ContentTopic[];
  categories: TopicCategory[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  
  // Actions
  generateTopics: (request: GenerateContentTopicsRequest) => Promise<GenerateContentTopicsResponse>;
  loadTopics: (companyId?: string) => Promise<void>;
  getContentTopics: (companyId?: string) => Promise<ContentTopic[]>;
  loadCategories: () => void;
  getTopic: (topicId: string) => Promise<ContentTopic>;
  updateTopic: (topicId: string, updateData: UpdateContentTopicRequest) => Promise<void>;
  deleteTopic: (topicId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  topics: [],
  categories: [],
  isLoading: false,
  isGenerating: false,
  error: null,
};

export const useContentTopicsStore = create<ContentTopicsState>((set, get) => ({
  ...initialState,

  generateTopics: async (request: GenerateContentTopicsRequest) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await contentTopicsService.generateTopics(request);
      set({ 
        topics: response.topics, 
        isGenerating: false 
      });
      return response;
    } catch (error) {
      set({ 
        isGenerating: false, 
        error: error instanceof Error ? error.message : 'Failed to generate content topics' 
      });
      throw error;
    }
  },

  loadTopics: async (companyId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const topics = await contentTopicsService.getTopics(companyId);
      set({ topics, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load content topics' 
      });
    }
  },

  getContentTopics: async (companyId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const topics = await contentTopicsService.getTopics(companyId);
      set({ topics, isLoading: false });
      return topics;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load content topics' 
      });
      throw error;
    }
  },

  loadCategories: () => {
    const categories = contentTopicsService.getCategories();
    set({ categories });
  },

  getTopic: async (topicId: string) => {
    set({ isLoading: true, error: null });
    try {
      const topic = await contentTopicsService.getTopic(topicId);
      set({ isLoading: false });
      return topic;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load content topic' 
      });
      throw error;
    }
  },

  updateTopic: async (topicId: string, updateData: UpdateContentTopicRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTopic = await contentTopicsService.updateTopic(topicId, updateData);
      set(state => ({
        topics: state.topics.map(topic => 
          topic.id === topicId ? updatedTopic : topic
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update content topic' 
      });
      throw error;
    }
  },

  deleteTopic: async (topicId: string) => {
    set({ isLoading: true, error: null });
    try {
      await contentTopicsService.deleteTopic(topicId);
      set(state => ({
        topics: state.topics.filter(topic => topic.id !== topicId),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete content topic' 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState)
}));