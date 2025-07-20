import { create } from 'zustand';
import { Company, CompanySearchResult } from '@internal-marketing-content-app/shared';
import { companyService } from '../services/companyService';

interface CompanySearchState {
  searchQuery: string;
  searchResults: CompanySearchResult | null;
  selectedCompany: Company | null;
  isSearching: boolean;
  error: string | null;
  
  // Manual entry state
  showManualEntry: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  searchCompanies: (query: string) => Promise<void>;
  selectCompany: (company: Company) => void;
  clearSelection: () => void;
  showManualEntryForm: () => void;
  hideManualEntryForm: () => void;
  createManualCompany: (companyData: any) => Promise<void>;
  clearError: () => void;
  seedMockData: () => Promise<void>;
}

export const useCompanyStore = create<CompanySearchState>((set, get) => ({
  searchQuery: '',
  searchResults: null,
  selectedCompany: null,
  isSearching: false,
  error: null,
  showManualEntry: false,

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  searchCompanies: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: null });
      return;
    }

    try {
      set({ isSearching: true, error: null });
      
      const results = await companyService.searchCompanies({ 
        query: query.trim(),
        limit: 10 
      });
      
      set({ 
        searchResults: results,
        isSearching: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Search failed',
        isSearching: false,
        searchResults: null
      });
    }
  },

  selectCompany: (company: Company) => {
    set({ 
      selectedCompany: company,
      showManualEntry: false 
    });
  },

  clearSelection: () => {
    set({ 
      selectedCompany: null,
      searchQuery: '',
      searchResults: null,
      showManualEntry: false
    });
  },

  showManualEntryForm: () => {
    set({ showManualEntry: true });
  },

  hideManualEntryForm: () => {
    set({ showManualEntry: false });
  },

  createManualCompany: async (companyData: any) => {
    try {
      set({ isSearching: true, error: null });
      
      const newCompany = await companyService.createCompany(companyData);
      
      set({ 
        selectedCompany: newCompany,
        showManualEntry: false,
        isSearching: false
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to create company',
        isSearching: false
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  seedMockData: async () => {
    try {
      await companyService.seedMockData();
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to seed mock data'
      });
    }
  }
}));