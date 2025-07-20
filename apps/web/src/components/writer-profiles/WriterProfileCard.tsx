import React from 'react';
import { WriterProfile } from '@internal-marketing-content-app/shared';

interface WriterProfileCardProps {
  profile: WriterProfile;
  onEdit: (profile: WriterProfile) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string, isActive: boolean) => void;
  isLoading?: boolean;
}

export const WriterProfileCard: React.FC<WriterProfileCardProps> = ({
  profile,
  onEdit,
  onDelete,
  onActivate,
  isLoading = false
}) => {
  const handleEdit = () => {
    onEdit(profile);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      onDelete(profile.id);
    }
  };

  const handleToggleActive = () => {
    onActivate(profile.id, !profile.isActive);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border p-6 transition-all hover:shadow-lg ${profile.isActive ? 'border-blue-200' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${profile.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {profile.isActive ? 'Active' : 'Inactive'}
            </span>
            {profile.isCustom && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                Custom
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{profile.position}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleActive}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              profile.isActive 
                ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' 
                : 'text-green-500 hover:text-green-700 hover:bg-green-50'
            }`}
            title={profile.isActive ? 'Deactivate profile' : 'Activate profile'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {profile.isActive ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M12 5v.01M12 19v.01M12 3a9 9 0 11-9 9 9 9 0 019-9z" />
              )}
            </svg>
          </button>
          
          <button
            onClick={handleEdit}
            disabled={isLoading}
            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Edit profile"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete profile"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Writing Style */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
            {profile.tone}
          </span>
          <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
            {profile.style}
          </span>
        </div>
      </div>

      {/* Target Audience */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Target Audience</h4>
        <p className="text-sm text-gray-600 line-clamp-2">{profile.targetAudience}</p>
      </div>

      {/* Content Focus Areas */}
      {profile.contentFocusAreas.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Content Focus</h4>
          <div className="flex flex-wrap gap-1">
            {profile.contentFocusAreas.slice(0, 3).map(area => (
              <span key={area} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {area}
              </span>
            ))}
            {profile.contentFocusAreas.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                +{profile.contentFocusAreas.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Social Platforms */}
      {profile.socialPlatforms.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Platforms</h4>
          <div className="flex flex-wrap gap-1">
            {profile.socialPlatforms.slice(0, 4).map(platform => (
              <span key={platform} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                {platform}
              </span>
            ))}
            {profile.socialPlatforms.length > 4 && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-500 rounded">
                +{profile.socialPlatforms.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Company Focus Tips */}
      {profile.companyFocusTips.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Focus Tips</h4>
          <p className="text-sm text-gray-600">
            {profile.companyFocusTips.length} tip{profile.companyFocusTips.length !== 1 ? 's' : ''} available
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Created: {new Date(profile.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(profile.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};