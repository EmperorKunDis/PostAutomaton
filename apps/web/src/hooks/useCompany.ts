import { useEffect } from 'react';
import { useCompanyStore } from '../stores/companyStore';

export const useCompany = () => {
  const companyStore = useCompanyStore();

  // Auto-search with debouncing
  useEffect(() => {
    if (companyStore.searchQuery.length > 2) {
      const debounceTimer = setTimeout(() => {
        companyStore.searchCompanies(companyStore.searchQuery);
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else if (companyStore.searchQuery.length === 0) {
      // Clear results when query is empty
      companyStore.searchCompanies('');
    }
  }, [companyStore.searchQuery]);

  return {
    searchQuery: companyStore.searchQuery,
    searchResults: companyStore.searchResults,
    selectedCompany: companyStore.selectedCompany,
    isSearching: companyStore.isSearching,
    error: companyStore.error,
    showManualEntry: companyStore.showManualEntry,
    
    // Actions
    setSearchQuery: companyStore.setSearchQuery,
    selectCompany: companyStore.selectCompany,
    clearSelection: companyStore.clearSelection,
    showManualEntryForm: companyStore.showManualEntryForm,
    hideManualEntryForm: companyStore.hideManualEntryForm,
    createManualCompany: companyStore.createManualCompany,
    clearError: companyStore.clearError,
    seedMockData: companyStore.seedMockData,
  };
};