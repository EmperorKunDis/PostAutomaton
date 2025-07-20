import React from 'react';
import { useCompany } from '../../hooks/useCompany';
import { CompanyCard } from './CompanyCard';
import { ManualCompanyForm } from './ManualCompanyForm';

export const CompanySearch: React.FC = () => {
  const {
    searchQuery,
    searchResults,
    isSearching,
    error,
    showManualEntry,
    setSearchQuery,
    selectCompany,
    showManualEntryForm,
    hideManualEntryForm,
    clearError,
    seedMockData
  } = useCompany();

  const handleSeedData = async () => {
    await seedMockData();
    // Optionally re-search to show new data
    if (searchQuery) {
      // The useCompany hook will automatically re-search
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Company
          </h1>
          <p className="text-gray-600">
            Search for your company to get started with content generation
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your company name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          
          {/* Seed data button for development */}
          <div className="mt-2 flex justify-center">
            <button
              onClick={handleSeedData}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Load sample companies (dev only)
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults && searchResults.companies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Found {searchResults.totalCount} companies for "{searchResults.searchQuery}"
            </h2>
            <div className="space-y-4">
              {searchResults.companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onSelect={selectCompany}
                  showConfidence={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchResults && searchResults.companies.length === 0 && searchQuery.length > 2 && (
          <div className="text-center py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No companies found
              </h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any companies matching "{searchQuery}"
              </p>
              <button
                onClick={showManualEntryForm}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Your Company Manually
              </button>
            </div>
          </div>
        )}

        {/* Manual Entry Option */}
        {searchResults && searchResults.companies.length > 0 && (
          <div className="text-center">
            <p className="text-gray-600 mb-2">Company not listed?</p>
            <button
              onClick={showManualEntryForm}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Add your company manually
            </button>
          </div>
        )}

        {/* Manual Entry Form */}
        {showManualEntry && (
          <div className="mt-8">
            <ManualCompanyForm onCancel={hideManualEntryForm} />
          </div>
        )}

        {/* Initial State */}
        {!searchQuery && !searchResults && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start by searching for your company
              </h3>
              <p className="text-gray-600">
                Type your company name in the search box above
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};