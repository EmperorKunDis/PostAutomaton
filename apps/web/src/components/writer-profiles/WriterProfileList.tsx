import React from 'react';
import { WriterProfile } from '@internal-marketing-content-app/shared';
import { WriterProfileCard } from './WriterProfileCard';

interface WriterProfileListProps {
  profiles: WriterProfile[];
  onEdit: (profile: WriterProfile) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string, isActive: boolean) => void;
  onCreateNew: () => void;
  onGenerate: () => void;
  isLoading?: boolean;
  emptyStateMessage?: string;
}

export const WriterProfileList: React.FC<WriterProfileListProps> = ({
  profiles,
  onEdit,
  onDelete,
  onActivate,
  onCreateNew,
  onGenerate,
  isLoading = false,
  emptyStateMessage = "No writer profiles found. Create your first profile to get started."
}) => {
  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Writer Profiles</h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">{emptyStateMessage}</p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onCreateNew}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Create Profile
          </button>
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Generate Profiles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Writer Profiles</h2>
          <p className="text-sm text-gray-600 mt-1">
            {profiles.length} profile{profiles.length !== 1 ? 's' : ''} • {profiles.filter(p => p.isActive).length} active
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Generate</span>
          </button>
          <button
            onClick={onCreateNew}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <select className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="all">All Profiles</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="custom">Custom Only</option>
            <option value="generated">Generated Only</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Sort:</span>
          <select className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="name">Name</option>
            <option value="created">Created Date</option>
            <option value="updated">Updated Date</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {profiles.map(profile => (
          <WriterProfileCard
            key={profile.id}
            profile={profile}
            onEdit={onEdit}
            onDelete={onDelete}
            onActivate={onActivate}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};