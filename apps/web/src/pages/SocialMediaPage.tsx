import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SocialMediaContentPlan,
  BlogPost,
  SocialMediaPlatform
} from '@internal-marketing-content-app/shared';
import { useSocialMediaStore } from '../stores/socialMediaStore';
import { useBlogPostStore } from '../stores/blogPostStore';
import { useCompanyStore } from '../stores/companyStore';
import { SocialMediaGenerationForm } from '../components/social-media/SocialMediaGenerationForm';
import { ContentPlanPreview } from '../components/social-media/ContentPlanPreview';

type ViewMode = 'list' | 'generate' | 'view';

const PLATFORM_INFO: Record<SocialMediaPlatform, { name: string; icon: string }> = {
  linkedin: { name: 'LinkedIn', icon: '💼' },
  twitter: { name: 'X (Twitter)', icon: '🐦' },
  facebook: { name: 'Facebook', icon: '📘' },
  instagram: { name: 'Instagram', icon: '📷' },
  tiktok: { name: 'TikTok', icon: '🎵' },
  youtube: { name: 'YouTube', icon: '📹' },
  pinterest: { name: 'Pinterest', icon: '📌' },
  threads: { name: 'Threads', icon: '🧵' },
  reddit: { name: 'Reddit', icon: '🤖' }
};

export const SocialMediaPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [selectedContentPlan, setSelectedContentPlan] = useState<SocialMediaContentPlan | null>(null);

  const { selectedCompany } = useCompanyStore();
  const { blogPosts, getBlogPosts } = useBlogPostStore();
  const { contentPlans, currentContentPlan, getContentPlans, setCurrentContentPlan, isLoading, error } = useSocialMediaStore();

  useEffect(() => {
    if (selectedCompany) {
      getBlogPosts(selectedCompany.id);
      getContentPlans(selectedCompany.id);
    }
  }, [selectedCompany, getBlogPosts, getContentPlans]);

  const approvedBlogPosts = blogPosts.filter(post => 
    post.status === 'approved' || post.status === 'published'
  );

  const handleGenerateClick = (blogPost: BlogPost) => {
    setSelectedBlogPost(blogPost);
    setViewMode('generate');
  };

  const handleViewContentPlan = (plan: SocialMediaContentPlan) => {
    setSelectedContentPlan(plan);
    setCurrentContentPlan(plan);
    setViewMode('view');
  };

  const handleGenerationComplete = () => {
    setViewMode('view');
    setSelectedContentPlan(currentContentPlan);
  };

  // Export functions for Story 4.3
  const handleExportCSV = async () => {
    if (!selectedContentPlan) return;
    
    try {
      const response = await fetch(`/api/social-media/content-plans/${selectedContentPlan.id}/export/csv`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `content-plan-${selectedContentPlan.id}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleExportNotion = async () => {
    if (!selectedContentPlan) return;
    
    try {
      const response = await fetch(`/api/social-media/content-plans/${selectedContentPlan.id}/export/notion`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Copy to clipboard as formatted JSON
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        alert('Notion format copied to clipboard! You can now import this into your Notion database.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleScheduleBuffer = () => {
    alert('Buffer integration coming soon! This will allow direct scheduling to your Buffer account.');
  };

  const handleScheduleHootsuite = () => {
    alert('Hootsuite integration coming soon! This will allow direct scheduling to your Hootsuite account.');
  };

  const handleCopyAllPosts = async () => {
    if (!selectedContentPlan) return;
    
    const allPostsText = selectedContentPlan.posts.map(post => 
      `=== ${PLATFORM_INFO[post.platform].name} ===\n${post.content}\n${post.hashtags.join(' ')}\n`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(allPostsText);
      alert('All posts copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Copy failed. Please try again.');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!selectedCompany) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please select a company first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Social Media Content</h1>
            <p className="mt-2 text-gray-600">
              Transform your blog posts into engaging social media content
            </p>
          </div>
          {viewMode !== 'list' && (
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Available Blog Posts */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Available Blog Posts for Social Media
            </h2>
            {approvedBlogPosts.length > 0 ? (
              <div className="grid gap-4">
                {approvedBlogPosts.map(post => {
                  const hasContentPlan = contentPlans.some(plan => plan.blogPostId === post.id);
                  
                  return (
                    <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{post.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{post.excerpt}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500">
                              {post.wordCount} words • {post.estimatedReadTime} min read
                            </span>
                            {hasContentPlan && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Social posts created
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleGenerateClick(post)}
                          className="ml-4 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Generate Social Posts
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">No approved blog posts available.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Approve a blog post first to generate social media content.
                </p>
              </div>
            )}
          </div>

          {/* Existing Content Plans */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Social Media Content Plans
            </h2>
            {contentPlans.length > 0 ? (
              <div className="grid gap-4">
                {contentPlans.map(plan => (
                  <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900">
                            Content Plan #{plan.id.slice(0, 8)}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(plan.status)}`}>
                            {plan.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                          <span>{plan.posts.length} posts</span>
                          <span>{plan.selectedPlatforms.length} platforms</span>
                          <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {plan.selectedPlatforms.map(platform => (
                            <span key={platform} className="text-lg" title={PLATFORM_INFO[platform].name}>
                              {PLATFORM_INFO[platform].icon}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewContentPlan(plan)}
                        className="ml-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:border-blue-400"
                      >
                        View Posts
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">No content plans created yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'generate' && selectedBlogPost && (
        <SocialMediaGenerationForm
          blogPost={selectedBlogPost}
          onGenerated={handleGenerationComplete}
          onCancel={() => setViewMode('list')}
        />
      )}

      {viewMode === 'view' && selectedContentPlan && (
        <ContentPlanPreview
          contentPlan={selectedContentPlan}
          onExportCSV={handleExportCSV}
          onExportNotion={handleExportNotion}
          onScheduleBuffer={handleScheduleBuffer}
          onScheduleHootsuite={handleScheduleHootsuite}
          onCopyAllPosts={handleCopyAllPosts}
        />
      )}
    </div>
  );
};