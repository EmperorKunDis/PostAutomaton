import React, { useState } from 'react';

interface SocialPlatformSelectorProps {
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
  disabled?: boolean;
}

const platformOptions = [
  { 
    name: 'LinkedIn', 
    icon: '💼', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Professional networking and B2B content'
  },
  { 
    name: 'Twitter', 
    icon: '🐦', 
    color: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Real-time updates and short-form content'
  },
  { 
    name: 'Facebook', 
    icon: '📘', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Social networking and community engagement'
  },
  { 
    name: 'Instagram', 
    icon: '📸', 
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    description: 'Visual content and lifestyle branding'
  },
  { 
    name: 'YouTube', 
    icon: '🎥', 
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Video content and tutorials'
  },
  { 
    name: 'TikTok', 
    icon: '🎵', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Short-form video and trending content'
  },
  { 
    name: 'Medium', 
    icon: '✍️', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Long-form articles and thought leadership'
  },
  { 
    name: 'Substack', 
    icon: '📧', 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Newsletter and subscription content'
  },
  { 
    name: 'Pinterest', 
    icon: '📌', 
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Visual discovery and inspiration'
  },
  { 
    name: 'Reddit', 
    icon: '🤖', 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Community discussions and forums'
  }
];

export const SocialPlatformSelector: React.FC<SocialPlatformSelectorProps> = ({
  selectedPlatforms,
  onPlatformsChange,
  disabled = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlatforms = platformOptions.filter(platform =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    platform.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlatformToggle = (platformName: string) => {
    if (disabled) return;
    
    const isSelected = selectedPlatforms.includes(platformName);
    if (isSelected) {
      onPlatformsChange(selectedPlatforms.filter(p => p !== platformName));
    } else {
      onPlatformsChange([...selectedPlatforms, platformName]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onPlatformsChange(filteredPlatforms.map(p => p.name));
  };

  const handleClearAll = () => {
    if (disabled) return;
    onPlatformsChange([]);
  };

  const selectedCount = selectedPlatforms.length;
  const totalCount = platformOptions.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Social Platforms</h3>
          <p className="text-sm text-gray-600">
            Select platforms where this profile will be used ({selectedCount}/{totalCount} selected)
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={disabled || filteredPlatforms.length === selectedPlatforms.length}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled || selectedPlatforms.length === 0}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search platforms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <svg 
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredPlatforms.map(platform => {
          const isSelected = selectedPlatforms.includes(platform.name);
          return (
            <div
              key={platform.name}
              onClick={() => handlePlatformToggle(platform.name)}
              className={`
                relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
                ${isSelected 
                  ? `${platform.color} border-current shadow-sm` 
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Selection indicator */}
              <div className="absolute top-2 right-2">
                {isSelected ? (
                  <div className="w-5 h-5 bg-current rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                )}
              </div>

              {/* Platform content */}
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{platform.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">{platform.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{platform.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No results */}
      {filteredPlatforms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No platforms found matching "{searchQuery}"</p>
        </div>
      )}

      {/* Selected platforms summary */}
      {selectedPlatforms.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Platforms:</h4>
          <div className="flex flex-wrap gap-1">
            {selectedPlatforms.map(platformName => {
              const platform = platformOptions.find(p => p.name === platformName);
              return (
                <span
                  key={platformName}
                  className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${platform?.color || 'bg-gray-100 text-gray-800'}`}
                >
                  <span className="mr-1">{platform?.icon}</span>
                  {platformName}
                  {!disabled && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlatformToggle(platformName);
                      }}
                      className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};