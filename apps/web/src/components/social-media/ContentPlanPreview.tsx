import React, { useState } from 'react';
import { 
  SocialMediaContentPlan,
  SocialMediaPlatform, 
  BlogPost 
} from '@internal-marketing-content-app/shared';
import { SocialMediaPostEditor } from './SocialMediaPostEditor';
import { useBlogPostStore } from '../../stores/blogPostStore';
import { useWriterProfileStore } from '../../stores/writerProfileStore';

interface ContentPlanPreviewProps {
  contentPlan: SocialMediaContentPlan;
  onExportCSV: () => void;
  onExportNotion: () => void;
  onScheduleBuffer: () => void;
  onScheduleHootsuite: () => void;
  onCopyAllPosts: () => void;
}

const PLATFORM_INFO: Record<SocialMediaPlatform, { name: string; icon: string }> = {
  linkedin: { name: 'LinkedIn', icon: '💼' },
  twitter: { name: 'X (Twitter)', icon: '🐦' },
  facebook: { name: 'Facebook', icon: '📘' },
  instagram: { name: 'Instagram', icon: '📷' },
  tiktok: { name: 'TikTok', icon: '🎵' },
  youtube: { name: 'YouTube Shorts', icon: '📹' },
  pinterest: { name: 'Pinterest', icon: '📌' },
  threads: { name: 'Threads', icon: '🧵' },
  reddit: { name: 'Reddit', icon: '🤖' }
};

export const ContentPlanPreview: React.FC<ContentPlanPreviewProps> = ({
  contentPlan,
  onExportCSV,
  onExportNotion,
  onScheduleBuffer,
  onScheduleHootsuite,
  onCopyAllPosts
}) => {
  const [filterPlatform, setFilterPlatform] = useState<SocialMediaPlatform | 'all'>('all');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'blog' | 'posts'>('summary');
  
  const { blogPosts } = useBlogPostStore();
  const { profiles: writerProfiles } = useWriterProfileStore();

  const blogPost = blogPosts.find(post => post.id === contentPlan.blogPostId);
  const usedWriterProfiles = writerProfiles.filter(profile => 
    contentPlan.selectedWriterProfiles.includes(profile.id)
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const platformStats = contentPlan.selectedPlatforms.reduce((acc, platform) => {
    const posts = contentPlan.posts.filter(post => post.platform === platform);
    acc[platform] = posts.length;
    return acc;
  }, {} as Record<SocialMediaPlatform, number>);

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Content Plan Preview
            </h1>
            <p className="text-gray-600 mt-1">
              Review and export your social media content plan
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(contentPlan.status)}`}>
            {contentPlan.status}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'summary', name: 'Summary', icon: '📊' },
              { id: 'blog', name: 'Blog Preview', icon: '📝' },
              { id: 'posts', name: 'Social Posts', icon: '📱' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 4.1: Summary View */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Plan Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Selected Networks */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Networks</h3>
              <div className="space-y-2">
                {contentPlan.selectedPlatforms.map(platform => (
                  <div key={platform} className="flex items-center justify-between bg-gray-50 rounded p-2">
                    <div className="flex items-center gap-2">
                      <span>{PLATFORM_INFO[platform].icon}</span>
                      <span className="text-sm">{PLATFORM_INFO[platform].name}</span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {platformStats[platform]} posts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Writer Profiles */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Writer Profiles</h3>
              <div className="space-y-2">
                {usedWriterProfiles.map(profile => (
                  <div key={profile.id} className="bg-gray-50 rounded p-2">
                    <p className="text-sm font-medium">{profile.name}</p>
                    <p className="text-xs text-gray-600">{profile.position} • {profile.tone}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Publishing Frequency */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Publishing Details</h3>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-sm">
                  <span className="font-medium">Frequency:</span> {contentPlan.publishingFrequency}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Total Posts:</span> {contentPlan.posts.length}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Platforms:</span> {contentPlan.selectedPlatforms.length}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Content Stats</h3>
              <div className="bg-gray-50 rounded p-2 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Visual Concepts:</span> {
                    contentPlan.posts.reduce((acc, post) => acc + (post.visualConcepts?.length || 0), 0)
                  }
                </p>
                <p className="text-sm">
                  <span className="font-medium">Video Posts:</span> {
                    contentPlan.posts.filter(post => post.mediaType === 'video').length
                  }
                </p>
                <p className="text-sm">
                  <span className="font-medium">Image Posts:</span> {
                    contentPlan.posts.filter(post => post.mediaType === 'image' || post.mediaType === 'carousel').length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.2: Blog Preview */}
      {activeTab === 'blog' && blogPost && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Source Blog Post</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 underline">
              Edit Blog Post
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Blog Title and Meta */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{blogPost.title}</h3>
              {blogPost.subtitle && (
                <p className="text-lg text-gray-600 mb-2">{blogPost.subtitle}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{blogPost.wordCount} words</span>
                <span>{blogPost.estimatedReadTime} min read</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(blogPost.status)}`}>
                  {blogPost.status}
                </span>
              </div>
            </div>

            {/* Blog Outline */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Article Outline</h4>
              <div className="bg-gray-50 rounded p-4">
                {blogPost.sections.map((section, index) => (
                  <div key={section.id} className="mb-2">
                    <p className="text-sm font-medium text-gray-800">
                      {index + 1}. {section.title}
                    </p>
                    <p className="text-xs text-gray-600 ml-4">{section.purpose}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Blog Summary */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded p-4">
                {blogPost.excerpt}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4.3: Post Preview Section */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {/* Platform Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Filter by platform:</span>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Platforms ({contentPlan.posts.length} posts)</option>
                {contentPlan.selectedPlatforms.map(platform => (
                  <option key={platform} value={platform}>
                    {PLATFORM_INFO[platform].name} ({platformStats[platform]} posts)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contentPlan.posts
              .filter(post => filterPlatform === 'all' || post.platform === filterPlatform)
              .map(post => (
                <SocialMediaPostEditor
                  key={post.id}
                  post={post}
                  platformName={PLATFORM_INFO[post.platform].name}
                  platformIcon={PLATFORM_INFO[post.platform].icon}
                />
              ))}
          </div>
        </div>
      )}

      {/* 4.5: Final Confirmation & 4.6: Export Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Finalize</h3>
        
        {!showConfirmation ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Review your content plan and export it to your preferred format or publishing tool.
            </p>
            
            {/* Export Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <button 
                onClick={onExportCSV}
                className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <span>📊</span>
                <div className="text-left">
                  <p className="font-medium text-sm">Export as CSV</p>
                  <p className="text-xs opacity-75">Spreadsheet format</p>
                </div>
              </button>

              <button 
                onClick={onExportNotion}
                className="flex items-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <span>🗂️</span>
                <div className="text-left">
                  <p className="font-medium text-sm">Export to Notion</p>
                  <p className="text-xs opacity-75">Structured database</p>
                </div>
              </button>

              <button 
                onClick={onScheduleBuffer}
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span>📅</span>
                <div className="text-left">
                  <p className="font-medium text-sm">Schedule in Buffer</p>
                  <p className="text-xs opacity-75">Direct scheduling</p>
                </div>
              </button>

              <button 
                onClick={onScheduleHootsuite}
                className="flex items-center gap-2 px-4 py-3 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <span>🦉</span>
                <div className="text-left">
                  <p className="font-medium text-sm">Schedule in Hootsuite</p>
                  <p className="text-xs opacity-75">Social media management</p>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={onCopyAllPosts}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
              >
                📋 Copy All Posts
              </button>
              
              <button 
                onClick={() => setShowConfirmation(true)}
                className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
              >
                Generate Full Content Plan
              </button>
            </div>
          </div>
        ) : (
          // Final Confirmation
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-green-600 text-4xl mb-3">✅</div>
              <h4 className="text-lg font-semibold text-green-900 mb-2">
                Content Plan Generated Successfully!
              </h4>
              <p className="text-green-700">
                Your social media content plan with {contentPlan.posts.length} posts across {contentPlan.selectedPlatforms.length} platforms is ready.
              </p>
            </div>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Back to Export Options
              </button>
              <button 
                onClick={onExportCSV}
                className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Export Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};