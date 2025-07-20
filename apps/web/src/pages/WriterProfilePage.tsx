import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WriterProfile } from '@internal-marketing-content-app/shared';
import { WriterProfileList } from '../components/writer-profiles/WriterProfileList';
import { WriterProfileForm } from '../components/writer-profiles/WriterProfileForm';
import { CompanyContextSummary } from '../components/company-context/CompanyContextSummary';
import { CompanyContextDisplay } from '../components/company-context/CompanyContextDisplay';
import { useWriterProfileStore } from '../stores/writerProfileStore';
import { useAuthStore } from '../stores/authStore';
import { useCompanyStore } from '../stores/companyStore';
import { useCompanyContextStore } from '../stores/companyContextStore';

type ViewMode = 'list' | 'create' | 'edit' | 'generate' | 'context';

export const WriterProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedCompany } = useCompanyStore();
  const {
    profiles,
    currentProfile,
    isLoading,
    error,
    loadProfiles,
    generateProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    setCurrentProfile,
    clearError
  } = useWriterProfileStore();

  const {
    contexts,
    currentContext,
    isLoading: contextLoading,
    error: contextError,
    loadContext,
    clearError: clearContextError
  } = useCompanyContextStore();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingProfile, setEditingProfile] = useState<WriterProfile | null>(null);

  // Load profiles and context on component mount
  useEffect(() => {
    if (user && selectedCompany) {
      loadProfiles({ 
        companyId: selectedCompany.id, 
        userId: user.id 
      });
      loadContext(selectedCompany.id);
    }
  }, [user, selectedCompany, loadProfiles, loadContext]);

  // Redirect if no company selected
  useEffect(() => {
    if (!selectedCompany) {
      navigate('/company-selection');
    }
  }, [selectedCompany, navigate]);

  if (!user || !selectedCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleCreateNew = () => {
    setEditingProfile(null);
    setViewMode('create');
  };

  const handleEdit = (profile: WriterProfile) => {
    setEditingProfile(profile);
    setCurrentProfile(profile);
    setViewMode('edit');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProfile(id);
      if (editingProfile?.id === id) {
        setViewMode('list');
        setEditingProfile(null);
      }
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  const handleActivate = async (id: string, isActive: boolean) => {
    try {
      await updateProfile(id, { isActive });
    } catch (error) {
      console.error('Failed to update profile status:', error);
    }
  };

  const handleGenerate = () => {
    setViewMode('generate');
  };

  const handleSave = async (profileData: Partial<WriterProfile>) => {
    try {
      if (editingProfile) {
        await updateProfile(editingProfile.id, profileData);
      } else {
        await createProfile({
          ...profileData,
          companyId: selectedCompany.id,
          userId: user.id
        } as Omit<WriterProfile, 'id' | 'createdAt' | 'updatedAt'>);
      }
      setViewMode('list');
      setEditingProfile(null);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingProfile(null);
    setCurrentProfile(null);
  };

  const handleViewContext = () => {
    setViewMode('context');
  };

  const handleGenerateProfiles = async () => {
    try {
      await generateProfiles(selectedCompany.id, user.id, 3);
      setViewMode('list');
    } catch (error) {
      console.error('Failed to generate profiles:', error);
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
      case 'edit':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <WriterProfileForm
                profile={editingProfile}
                companyId={selectedCompany.id}
                userId={user.id}
                onSave={handleSave}
                onCancel={handleCancel}
                isLoading={isLoading}
              />
            </div>
            <div className="xl:col-span-1">
              {currentContext && (
                <CompanyContextSummary
                  context={currentContext}
                  onViewDetails={handleViewContext}
                  className="sticky top-4"
                />
              )}
            </div>
          </div>
        );

      case 'generate':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Generate Writer Profiles</h2>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Generate AI-powered writer profiles based on your company context and industry best practices.
                    We'll create 3 different profiles with varying tones, styles, and content focus areas.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Company: {selectedCompany.name}</h3>
                    <p className="text-sm text-blue-700">
                      Industry: {selectedCompany.industry}
                    </p>
                    {selectedCompany.description && (
                      <p className="text-sm text-blue-700 mt-1">
                        {selectedCompany.description}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerateProfiles}
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <span>{isLoading ? 'Generating...' : 'Generate Profiles'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="xl:col-span-1">
              {currentContext && (
                <CompanyContextSummary
                  context={currentContext}
                  onViewDetails={handleViewContext}
                  className="sticky top-4"
                />
              )}
            </div>
          </div>
        );

      case 'context':
        return currentContext ? (
          <CompanyContextDisplay context={currentContext} />
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading company context...</p>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <WriterProfileList
                profiles={profiles}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onActivate={handleActivate}
                onCreateNew={handleCreateNew}
                onGenerate={handleGenerate}
                isLoading={isLoading}
              />
            </div>
            <div className="xl:col-span-1">
              {currentContext && (
                <CompanyContextSummary
                  context={currentContext}
                  onViewDetails={handleViewContext}
                  className="sticky top-4"
                />
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Writer Profiles</h1>
                <p className="text-sm text-gray-600">{selectedCompany.name}</p>
              </div>
            </div>
            
            {viewMode !== 'list' && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back to List
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(error || contextError) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {contextError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-yellow-700">Company context: {contextError}</span>
              </div>
              <button
                onClick={clearContextError}
                className="text-yellow-500 hover:text-yellow-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};