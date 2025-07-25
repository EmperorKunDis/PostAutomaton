import React, { useState, useEffect } from 'react';
import { 
  GenerateSocialPostsRequest, 
  SocialMediaPlatform,
  BlogPost,
  WriterProfile,
  PLATFORM_CONSTRAINTS
} from '@internal-marketing-content-app/shared';
import { useSocialMediaStore } from '../../stores/socialMediaStore';
import { useWriterProfileStore } from '../../stores/writerProfileStore';

interface SocialMediaGenerationFormProps {
  blogPost: BlogPost;
  onGenerated: () => void;
  onCancel: () => void;
}

const PLATFORM_INFO: Record<SocialMediaPlatform, { name: string; icon: string; color: string }> = {
  linkedin: { name: 'LinkedIn', icon: '💼', color: 'bg-blue-600' },
  twitter: { name: 'X (Twitter)', icon: '🐦', color: 'bg-gray-900' },
  facebook: { name: 'Facebook', icon: '📘', color: 'bg-blue-500' },
  instagram: { name: 'Instagram', icon: '📷', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  tiktok: { name: 'TikTok', icon: '🎵', color: 'bg-black' },
  youtube: { name: 'YouTube Shorts', icon: '📹', color: 'bg-red-600' },
  pinterest: { name: 'Pinterest', icon: '📌', color: 'bg-red-500' },
  threads: { name: 'Threads', icon: '🧵', color: 'bg-gray-800' },
  reddit: { name: 'Reddit', icon: '🤖', color: 'bg-orange-500' }
};

export const SocialMediaGenerationForm: React.FC<SocialMediaGenerationFormProps> = ({
  blogPost,
  onGenerated,
  onCancel
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialMediaPlatform[]>(['linkedin', 'twitter']);
  const [selectedWriterProfiles, setSelectedWriterProfiles] = useState<string[]>([]);
  const [includeVisuals, setIncludeVisuals] = useState(true);
  const [postsPerPlatform, setPostsPerPlatform] = useState(3);
  
  const { generateSocialPosts, isGenerating, error } = useSocialMediaStore();
  const { profiles: writerProfiles, loadProfiles: loadWriterProfiles } = useWriterProfileStore();

  useEffect(() => {
    loadWriterProfiles();
  }, [loadWriterProfiles]);

  useEffect(() => {
    // Pre-select the blog post's writer profile if available
    if (blogPost.writerProfileId && !selectedWriterProfiles.includes(blogPost.writerProfileId)) {
      setSelectedWriterProfiles([blogPost.writerProfileId]);
    }
  }, [blogPost.writerProfileId]);

  const togglePlatform = (platform: SocialMediaPlatform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const toggleWriterProfile = (profileId: string) => {
    setSelectedWriterProfiles(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    const request: GenerateSocialPostsRequest = {
      blogPostId: blogPost.id,
      platforms: selectedPlatforms,
      writerProfileIds: selectedWriterProfiles.length > 0 ? selectedWriterProfiles : undefined,
      includeVisuals,
      postsPerPlatform
    };

    try {
      await generateSocialPosts(request);
      onGenerated();
    } catch (error) {
      console.error('Failed to generate social posts:', error);
    }
  };

  const estimatedPostCount = selectedPlatforms.length * selectedWriterProfiles.length * postsPerPlatform;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Generate Social Media Posts
      </h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          From blog post: <span className="font-medium">{blogPost.title}</span>
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Platforms
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(PLATFORM_INFO) as SocialMediaPlatform[]).map(platform => {
              const info = PLATFORM_INFO[platform];
              const isSelected = selectedPlatforms.includes(platform);
              const constraints = PLATFORM_CONSTRAINTS[platform];
              
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{info.icon}</span>
                      <span className="font-medium text-sm">{info.name}</span>
                    </div>
                    {isSelected && (
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {constraints.maxChars} chars
                    {constraints.requiresVideo && ' • Video only'}
                    {constraints.requiresImage && ' • Image required'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Writer Profile Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Writer Profiles (Optional)
          </label>
          <div className="space-y-2">
            {writerProfiles.map((profile: WriterProfile) => {
              const isSelected = selectedWriterProfiles.includes(profile.id);
              
              return (
                <label
                  key={profile.id}
                  className={`
                    flex items-center p-3 rounded-lg border cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleWriterProfile(profile.id)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="font-medium text-gray-900">{profile.name}</p>
                      <p className="text-sm text-gray-600">
                        {profile.position} • {profile.tone} tone
                      </p>
                    </div>
                    {isSelected && (
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
          {writerProfiles.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No writer profiles available. Create one in Settings.
            </p>
          )}
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeVisuals}
                onChange={(e) => setIncludeVisuals(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Include visual concepts (for Instagram, TikTok, etc.)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posts per platform
            </label>
            <select
              value={postsPerPlatform}
              onChange={(e) => setPostsPerPlatform(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 post</option>
              <option value={2}>2 posts</option>
              <option value={3}>3 posts</option>
              <option value={4}>4 posts</option>
              <option value={5}>5 posts</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Estimated output:</span> {estimatedPostCount} social media posts
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {selectedPlatforms.length} platforms × {selectedWriterProfiles.length || 1} writer profiles × {postsPerPlatform} posts each
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:border-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isGenerating || selectedPlatforms.length === 0}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isGenerating ? 'Generating...' : 'Generate Social Posts'}
          </button>
        </div>
      </form>
    </div>
  );
};