import { create } from 'zustand';
import { CompanyContext, CompanySizeIndicator, TargetMarket } from '@internal-marketing-content-app/shared';
import { companyContextService } from '../services/companyContextService';

interface CompanyContextState {
  contexts: Record<string, CompanyContext>; // keyed by companyId
  currentContext: CompanyContext | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadContext: (companyId: string) => Promise<void>;
  analyzeCompany: (companyName: string, industry: string, description?: string) => Promise<void>;
  createContext: (context: Omit<CompanyContext, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContext: (companyId: string, updates: Partial<CompanyContext>) => Promise<void>;
  deleteContext: (companyId: string) => Promise<void>;
  setCurrentContext: (context: CompanyContext | null) => void;
  clearError: () => void;
}

export const useCompanyContextStore = create<CompanyContextState>((set, get) => ({
  contexts: {},
  currentContext: null,
  isLoading: false,
  error: null,

  loadContext: async (companyId) => {
    try {
      set({ isLoading: true, error: null });
      const context = await companyContextService.getContext(companyId);
      
      const contexts = { ...get().contexts };
      contexts[companyId] = context;
      
      set({ 
        contexts,
        currentContext: context,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load context',
        isLoading: false 
      });
    }
  },

  analyzeCompany: async (companyName, industry, description) => {
    try {
      set({ isLoading: true, error: null });
      const context = await companyContextService.analyzeCompany({
        companyName,
        industry,
        description
      });
      
      const contexts = { ...get().contexts };
      contexts[context.companyId] = context;
      
      set({ 
        contexts,
        currentContext: context,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to analyze company',
        isLoading: false 
      });
    }
  },

  createContext: async (contextData) => {
    try {
      set({ isLoading: true, error: null });
      const context = await companyContextService.createContext(contextData);
      
      const contexts = { ...get().contexts };
      contexts[context.companyId] = context;
      
      set({ 
        contexts,
        currentContext: context,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create context',
        isLoading: false 
      });
    }
  },

  updateContext: async (companyId, updates) => {
    try {
      set({ isLoading: true, error: null });
      const updatedContext = await companyContextService.updateContext(companyId, updates);
      
      const contexts = { ...get().contexts };
      contexts[companyId] = updatedContext;
      
      set({ 
        contexts,
        currentContext: get().currentContext?.companyId === companyId ? updatedContext : get().currentContext,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update context',
        isLoading: false 
      });
    }
  },

  deleteContext: async (companyId) => {
    try {
      set({ isLoading: true, error: null });
      await companyContextService.deleteContext(companyId);
      
      const contexts = { ...get().contexts };
      delete contexts[companyId];
      
      const currentContext = get().currentContext?.companyId === companyId ? null : get().currentContext;
      
      set({ 
        contexts,
        currentContext,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete context',
        isLoading: false 
      });
    }
  },

  setCurrentContext: (context) => {
    set({ currentContext: context });
  },

  clearError: () => {
    set({ error: null });
  }
}));