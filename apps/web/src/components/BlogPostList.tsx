import React, { useEffect, useState } from 'react';
import { BlogPost } from '@internal-marketing-content-app/shared';
import { useBlogPostStore } from '../stores/blogPostStore';
import { useCompanyStore } from '../stores/companyStore';

interface BlogPostListProps {
  onSelectBlogPost?: (blogPost: BlogPost) => void;
}

export const BlogPostList: React.FC<BlogPostListProps> = ({ onSelectBlogPost }) => {
  const [filter, setFilter] = useState<'all' | 'draft' | 'review' | 'approved'>('all');
  
  const { selectedCompany } = useCompanyStore();
  const { blogPosts, isLoading, error, getBlogPosts, deleteBlogPost } = useBlogPostStore();

  useEffect(() => {
    if (selectedCompany) {
      getBlogPosts(selectedCompany.id);
    }
  }, [selectedCompany, getBlogPosts]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'outline_review': return 'bg-yellow-100 text-yellow-800';
      case 'content_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBlogPosts = blogPosts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'draft') return post.status === 'draft';
    if (filter === 'review') return post.status.includes('review');
    if (filter === 'approved') return post.status === 'approved' || post.status === 'published';
    return true;
  });

  const handleDelete = async (postId: string) => {
    if (confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        await deleteBlogPost(postId);
      } catch (error) {
        console.error('Failed to delete blog post:', error);
      }
    }
  };

  if (!selectedCompany) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Please select a company first to view blog posts.</p>
      </div>
    );
  }

  if (isLoading && blogPosts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Blog Posts</h2>
          <div className="flex items-center space-x-2">
            <label htmlFor="filter" className="text-sm font-medium text-gray-700">
              Filter:
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="draft">Drafts</option>
              <option value="review">In Review</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {filteredBlogPosts.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Generate your first blog post from a content topic.'
              : `No blog posts found with status "${filter}".`
            }
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredBlogPosts.map((post) => (
            <div key={post.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => onSelectBlogPost?.(post)}>
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-900 mr-3">
                      {post.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(post.status)}`}>
                      {post.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  {post.subtitle && (
                    <p className="text-md text-gray-700 mb-2">{post.subtitle}</p>
                  )}
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span>Target: {post.targetWordCount} words</span>
                    <span>•</span>
                    <span>{post.estimatedReadTime} min read</span>
                    <span>•</span>
                    <span>{post.sections.length} sections</span>
                    <span>•</span>
                    <span>Created {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onSelectBlogPost?.(post)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:border-blue-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:border-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};