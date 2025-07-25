import { create } from 'zustand';
import {
  ContentLibrarySearchRequest,
  ContentLibrarySearchResponse,
  ContentAsset,
  ContentTag,
  ReusableSnippet,
  MediaAsset,
  ContentAssetType,
  ContentStatus
} from '@internal-marketing-content-app/shared';
import { contentLibraryService } from '../services/contentLibraryService';

export interface ContentLibraryFilters {
  search?: string;
  type?: ContentAssetType[];
  status?: ContentStatus[];
  tags?: string[];
  category?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface ContentLibrarySort {
  field: 'createdAt' | 'updatedAt' | 'title' | 'timesUsed' | 'lastUsed';
  direction: 'asc' | 'desc';
}

interface ContentLibraryState {
  // Search Results
  assets: ContentAsset[];
  snippets: ReusableSnippet[];
  mediaAssets: MediaAsset[];
  availableTags: ContentTag[];
  
  // Pagination
  totalCount: number;
  totalPages: number;
  currentPage: number;
  
  // Search State
  filters: ContentLibraryFilters;
  sort: ContentLibrarySort;
  loading: boolean;
  error: string | null;
  
  // UI State
  selectedAssets: string[];
  showTagManager: boolean;
  showSnippetEditor: boolean;
  editingSnippet: ReusableSnippet | null;
  
  // Actions
  searchContent: (companyId: string, customFilters?: Partial<ContentLibraryFilters>) => Promise<void>;
  updateFilters: (filters: Partial<ContentLibraryFilters>) => void;
  updateSort: (sort: ContentLibrarySort) => void;
  loadPage: (page: number, companyId: string) => Promise<void>;
  
  // Asset Management
  selectAsset: (assetId: string) => void;
  deselectAsset: (assetId: string) => void;
  clearSelection: () => void;
  updateAsset: (assetId: string, updates: Partial<ContentAsset>) => Promise<void>;
  
  // Tag Management
  createTag: (tagData: Omit<ContentTag, 'id' | 'createdAt' | 'updatedAt'>, companyId: string) => Promise<void>;
  setShowTagManager: (show: boolean) => void;
  
  // Snippet Management
  createSnippet: (snippetData: Omit<ReusableSnippet, 'id' | 'createdAt' | 'updatedAt' | 'timesUsed' | 'lastUsed'>, companyId: string) => Promise<void>;
  updateSnippet: (snippetId: string, updates: Partial<ReusableSnippet>) => Promise<void>;
  setEditingSnippet: (snippet: ReusableSnippet | null) => void;
  setShowSnippetEditor: (show: boolean) => void;
  
  // Utility
  syncExistingContent: (companyId: string) => Promise<void>;
  trackAssetUsage: (assetId: string, usedInType: 'blog_post' | 'social_post' | 'campaign', usedInId: string, platform?: string) => Promise<void>;
}

export const useContentLibraryStore = create<ContentLibraryState>((set, get) => ({
  // Initial State
  assets: [],
  snippets: [],
  mediaAssets: [],
  availableTags: [],
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
  filters: {},
  sort: { field: 'updatedAt', direction: 'desc' },
  loading: false,
  error: null,
  selectedAssets: [],
  showTagManager: false,
  showSnippetEditor: false,
  editingSnippet: null,

  // Search Actions
  searchContent: async (companyId: string, customFilters?: Partial<ContentLibraryFilters>) => {
    set({ loading: true, error: null });
    
    try {
      const state = get();
      const filters = { ...state.filters, ...customFilters };
      
      const searchRequest: ContentLibrarySearchRequest = {
        filters: {
          companyId,
          ...filters
        },
        sort: state.sort,
        pagination: {
          page: state.currentPage,
          limit: 20
        }
      };

      const response = await contentLibraryService.searchContentLibrary(searchRequest);
      
      set({
        assets: response.assets || [],
        snippets: response.snippets || [],
        mediaAssets: response.mediaAssets || [],
        availableTags: response.tags || [],
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        filters,
        loading: false
      });
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to search content library'
      });
    }
  },

  updateFilters: (newFilters: Partial<ContentLibraryFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1 // Reset to first page when filters change
    }));
  },

  updateSort: (sort: ContentLibrarySort) => {
    set({ sort, currentPage: 1 });
  },

  loadPage: async (page: number, companyId: string) => {
    set({ currentPage: page });
    await get().searchContent(companyId);
  },

  // Asset Management
  selectAsset: (assetId: string) => {
    set(state => ({
      selectedAssets: [...state.selectedAssets, assetId]
    }));
  },

  deselectAsset: (assetId: string) => {
    set(state => ({
      selectedAssets: state.selectedAssets.filter(id => id !== assetId)
    }));
  },

  clearSelection: () => {
    set({ selectedAssets: [] });
  },

  updateAsset: async (assetId: string, updates: Partial<ContentAsset>) => {
    try {
      const updatedAsset = await contentLibraryService.updateContentAsset(assetId, updates);
      
      set(state => ({
        assets: state.assets.map(asset => 
          asset.id === assetId ? { ...asset, ...updatedAsset } : asset
        )
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update asset' });
    }
  },

  // Tag Management
  createTag: async (tagData: Omit<ContentTag, 'id' | 'createdAt' | 'updatedAt'>, companyId: string) => {
    try {
      const newTag = await contentLibraryService.createContentTag(tagData, companyId);
      
      set(state => ({
        availableTags: [...state.availableTags, newTag]
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create tag' });
    }
  },

  setShowTagManager: (show: boolean) => {
    set({ showTagManager: show });
  },

  // Snippet Management
  createSnippet: async (snippetData: Omit<ReusableSnippet, 'id' | 'createdAt' | 'updatedAt' | 'timesUsed' | 'lastUsed'>, companyId: string) => {
    try {
      const newSnippet = await contentLibraryService.createReusableSnippet(snippetData, companyId);
      
      set(state => ({
        snippets: [...state.snippets, newSnippet]
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create snippet' });
    }
  },

  updateSnippet: async (snippetId: string, updates: Partial<ReusableSnippet>) => {
    try {
      const updatedSnippet = await contentLibraryService.updateReusableSnippet(snippetId, updates);
      
      set(state => ({
        snippets: state.snippets.map(snippet => 
          snippet.id === snippetId ? { ...snippet, ...updatedSnippet } : snippet
        )
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update snippet' });
    }
  },

  setEditingSnippet: (snippet: ReusableSnippet | null) => {
    set({ editingSnippet: snippet });
  },

  setShowSnippetEditor: (show: boolean) => {
    set({ showSnippetEditor: show });
  },

  // Utility Actions
  syncExistingContent: async (companyId: string) => {
    set({ loading: true });
    
    try {
      await contentLibraryService.syncExistingContent(companyId);
      // Refresh the content after sync
      await get().searchContent(companyId);
    } catch (error) {
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to sync existing content'
      });
    }
  },

  trackAssetUsage: async (
    assetId: string,
    usedInType: 'blog_post' | 'social_post' | 'campaign',
    usedInId: string,
    platform?: string
  ) => {
    try {
      await contentLibraryService.trackAssetUsage(assetId, usedInType, usedInId, platform);
      
      // Update the asset's usage count locally
      set(state => ({
        assets: state.assets.map(asset => 
          asset.id === assetId 
            ? { 
                ...asset, 
                timesUsed: (asset.timesUsed || 0) + 1,
                lastUsed: new Date()
              }
            : asset
        )
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to track asset usage' });
    }
  }
}));