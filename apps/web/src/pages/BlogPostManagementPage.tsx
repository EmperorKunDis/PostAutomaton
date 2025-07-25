import React, { useState } from 'react';
import { BlogPost, ContentTopic } from '@internal-marketing-content-app/shared';
import { BlogPostGenerationForm } from '../components/BlogPostGenerationForm';
import { BlogPostEditor } from '../components/BlogPostEditor';
import { BlogPostList } from '../components/BlogPostList';
import { useBlogPostStore } from '../stores/blogPostStore';
import { useCompanyStore } from '../stores/companyStore';

type ViewMode = 'list' | 'generate' | 'edit';

export const BlogPostManagementPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<ContentTopic | undefined>(undefined);

  const { selectedCompany } = useCompanyStore();
  const { currentBlogPost, getBlogPost } = useBlogPostStore();

  const handleGenerateBlogPost = () => {
    setSelectedTopic(undefined);
    setSelectedBlogPost(null);
    setViewMode('generate');
  };

  const handleBlogPostGenerated = async (blogPostId: string) => {
    try {
      const blogPost = await getBlogPost(blogPostId);
      setSelectedBlogPost(blogPost);
      setViewMode('edit');
    } catch (error) {
      console.error('Failed to load generated blog post:', error);
      setViewMode('list');
    }
  };

  const handleSelectBlogPost = async (blogPost: BlogPost) => {
    try {
      const fullBlogPost = await getBlogPost(blogPost.id);
      setSelectedBlogPost(fullBlogPost);
      setViewMode('edit');
    } catch (error) {
      console.error('Failed to load blog post:', error);
    }
  };

  const handleBackToList = () => {
    setSelectedBlogPost(null);
    setSelectedTopic(undefined);
    setViewMode('list');
  };

  if (!selectedCompany) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Please select a company first to manage blog posts.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog Post Management</h1>
              <p className="mt-2 text-gray-600">
                Generate and manage blog posts for {selectedCompany.name}
              </p>
            </div>
            
            {viewMode === 'list' && (
              <button
                onClick={handleGenerateBlogPost}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Generate New Blog Post
              </button>
            )}
            
            {(viewMode === 'generate' || viewMode === 'edit') && (
              <button
                onClick={handleBackToList}
                className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Back to List
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <button
                onClick={handleBackToList}
                className={`hover:text-gray-700 ${viewMode === 'list' ? 'text-gray-900 font-medium' : ''}`}
              >
                Blog Posts
              </button>
            </li>
            {viewMode === 'generate' && (
              <>
                <li>
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li className="text-gray-900 font-medium">Generate New</li>
              </>
            )}
            {viewMode === 'edit' && selectedBlogPost && (
              <>
                <li>
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li className="text-gray-900 font-medium truncate max-w-xs">
                  {selectedBlogPost.title}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Content */}
        <div className="space-y-6">
          {viewMode === 'list' && (
            <BlogPostList onSelectBlogPost={handleSelectBlogPost} />
          )}
          
          {viewMode === 'generate' && (
            <BlogPostGenerationForm
              selectedTopic={selectedTopic}
              onBlogPostGenerated={handleBlogPostGenerated}
            />
          )}
          
          {viewMode === 'edit' && selectedBlogPost && (
            <BlogPostEditor blogPost={selectedBlogPost} />
          )}
        </div>
      </div>
    </div>
  );
};