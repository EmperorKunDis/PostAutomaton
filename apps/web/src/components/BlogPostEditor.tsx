import React, { useState, useEffect } from 'react';
import { 
  BlogPost, 
  BlogPostSection, 
  UpdateBlogPostSectionRequest,
  RegenerateBlogPostSectionRequest 
} from '@internal-marketing-content-app/shared';
import { useBlogPostStore } from '../stores/blogPostStore';
import { ContentVersionHistory } from './ContentVersionHistory';
import { ParagraphHistory } from './ParagraphHistory';

interface BlogPostEditorProps {
  blogPost: BlogPost;
}

interface EditingSection {
  sectionId: string;
  title: string;
  content: string;
  suggestions: string[];
}

export const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ blogPost }) => {
  const [editingSection, setEditingSection] = useState<EditingSection | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [regenerateModalSection, setRegenerateModalSection] = useState<BlogPostSection | null>(null);
  const [regenerateInstructions, setRegenerateInstructions] = useState('');
  const [regenerateTone, setRegenerateTone] = useState<'professional' | 'casual' | 'same'>('same');
  const [regenerateLength, setRegenerateLength] = useState<'shorter' | 'longer' | 'same'>('same');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showParagraphHistory, setShowParagraphHistory] = useState<{sectionId: string, paragraphIndex: number} | null>(null);
  
  const { 
    updateBlogPostSection, 
    regenerateSection,
    deleteSection,
    approveBlogPost,
    isLoading, 
    error 
  } = useBlogPostStore();

  // Initialize with all sections expanded
  useEffect(() => {
    setExpandedSections(new Set(blogPost.sections.map(s => s.id)));
  }, [blogPost.sections]);

  const handleEditSection = (section: BlogPostSection) => {
    setEditingSection({
      sectionId: section.id,
      title: section.title,
      content: section.content,
      suggestions: section.suggestions || []
    });
  };

  const handleSaveSection = async () => {
    if (!editingSection) return;

    try {
      const request: UpdateBlogPostSectionRequest = {
        sectionId: editingSection.sectionId,
        title: editingSection.title,
        content: editingSection.content,
        suggestions: editingSection.suggestions
      };

      await updateBlogPostSection(blogPost.id, editingSection.sectionId, request);
      setEditingSection(null);
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const applySuggestion = (suggestionIndex: number) => {
    if (!editingSection) return;
    
    const suggestion = editingSection.suggestions[suggestionIndex];
    setEditingSection(prev => prev ? {
      ...prev,
      content: suggestion,
      suggestions: prev.suggestions.filter((_, index) => index !== suggestionIndex)
    } : null);
  };

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

  const getSectionStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'needs_revision': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproveSection = async (section: BlogPostSection) => {
    await updateBlogPostSection(blogPost.id, section.id, {
      sectionId: section.id,
      status: 'approved'
    });
  };

  const handleRejectSection = async (section: BlogPostSection) => {
    await updateBlogPostSection(blogPost.id, section.id, {
      sectionId: section.id,
      status: 'needs_revision'
    });
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      await deleteSection(blogPost.id, sectionId);
    }
  };

  const handleRegenerateSection = async () => {
    if (!regenerateModalSection) return;
    
    const request: RegenerateBlogPostSectionRequest = {
      sectionId: regenerateModalSection.id,
      instructions: regenerateInstructions.trim() || undefined,
      tone: regenerateTone !== 'same' ? regenerateTone : undefined,
      length: regenerateLength
    };
    
    await regenerateSection(blogPost.id, regenerateModalSection.id, request);
    setRegenerateModalSection(null);
    setRegenerateInstructions('');
    setRegenerateTone('same');
    setRegenerateLength('same');
  };

  const handleApproveBlogPost = async () => {
    const allApproved = blogPost.sections.every(s => s.status === 'approved');
    if (!allApproved) {
      alert('All sections must be approved before approving the blog post');
      return;
    }
    
    await approveBlogPost(blogPost.id, { 
      blogPostId: blogPost.id,
      status: 'approved' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{blogPost.title}</h1>
            {blogPost.subtitle && (
              <p className="text-lg text-gray-600 mb-3">{blogPost.subtitle}</p>
            )}
            <p className="text-gray-600 mb-4">{blogPost.excerpt}</p>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(blogPost.status)}`}>
                {blogPost.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                Target: {blogPost.targetWordCount} words
              </span>
              <span className="text-sm text-gray-500">
                Estimated: {blogPost.estimatedReadTime} min read
              </span>
            </div>
          </div>
          <div>
            <button
              onClick={() => setShowVersionHistory(true)}
              className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Version History
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Outline */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Article Outline</h2>
        <div className="space-y-2">
          {blogPost.outline.sections.map((section, index) => (
            <div key={index} className="flex items-center text-sm">
              <span className="text-gray-400 mr-3">{index + 1}.</span>
              <span className="text-gray-700">{section.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-gray-200">
        {blogPost.sections.map((section, index) => {
          const isExpanded = expandedSections.has(section.id);
          const isEditing = editingSection?.sectionId === section.id;
          
          return (
            <div key={section.id} className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="mr-3 text-gray-400 hover:text-gray-600"
                  >
                    <svg 
                      className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <h3 className="text-lg font-medium text-gray-900">
                    {index + 1}. {section.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSectionStatusBadgeColor(section.status)}`}>
                    {section.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {isExpanded && !isEditing && (
                    <div className="flex items-center gap-2">
                      {section.status !== 'approved' && (
                        <button
                          onClick={() => handleApproveSection(section)}
                          className="px-2 py-1 text-xs text-green-600 hover:text-green-800 border border-green-300 rounded hover:border-green-400"
                        >
                          Approve
                        </button>
                      )}
                      {section.status === 'approved' && (
                        <button
                          onClick={() => handleRejectSection(section)}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800 border border-red-300 rounded hover:border-red-400"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleEditSection(section)}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:border-blue-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setRegenerateModalSection(section)}
                        className="px-2 py-1 text-xs text-purple-600 hover:text-purple-800 border border-purple-300 rounded hover:border-purple-400"
                      >
                        Regenerate
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="px-2 py-1 text-xs text-red-600 hover:text-red-800 border border-red-300 rounded hover:border-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="ml-8">
                  {isEditing ? (
                    <div className="space-y-4">
                      {/* Edit Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={editingSection.title}
                          onChange={(e) => setEditingSection(prev => prev ? {
                            ...prev,
                            title: e.target.value
                          } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* Edit Content */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <textarea
                          value={editingSection.content}
                          onChange={(e) => setEditingSection(prev => prev ? {
                            ...prev,
                            content: e.target.value
                          } : null)}
                          rows={12}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                      </div>
                      
                      {/* AI Suggestions */}
                      {editingSection.suggestions.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            AI Suggestions
                          </label>
                          <div className="space-y-2">
                            {editingSection.suggestions.map((suggestion, suggestionIndex) => (
                              <div key={suggestionIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-gray-700 mb-2">{suggestion}</p>
                                <button
                                  onClick={() => applySuggestion(suggestionIndex)}
                                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Apply Suggestion
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:border-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveSection}
                          disabled={isLoading}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700">
                        {section.content.split('\n\n').map((paragraph, paragraphIndex) => (
                          <div key={paragraphIndex} className="relative group mb-4">
                            <p className="inline">{paragraph}</p>
                            <button
                              onClick={() => setShowParagraphHistory({sectionId: section.id, paragraphIndex})}
                              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                              title="View paragraph history"
                            >
                              <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {section.suggestions && section.suggestions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Available Suggestions:</p>
                          <div className="text-sm text-blue-600">
                            {section.suggestions.length} AI suggestion{section.suggestions.length !== 1 ? 's' : ''} available
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Approval Section */}
      {blogPost.status === 'content_review' && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Blog Post Approval</h3>
              <p className="text-sm text-gray-600 mt-1">
                {blogPost.sections.filter(s => s.status === 'approved').length} of {blogPost.sections.length} sections approved
              </p>
            </div>
            <button
              onClick={handleApproveBlogPost}
              disabled={!blogPost.sections.every(s => s.status === 'approved')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Approve Blog Post
            </button>
          </div>
        </div>
      )}

      {/* Regenerate Modal */}
      {regenerateModalSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Regenerate Section: {regenerateModalSection.title}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Instructions (optional)
                </label>
                <textarea
                  value={regenerateInstructions}
                  onChange={(e) => setRegenerateInstructions(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide specific instructions for regeneration..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tone
                </label>
                <select
                  value={regenerateTone}
                  onChange={(e) => setRegenerateTone(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="same">Keep Same</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length
                </label>
                <select
                  value={regenerateLength}
                  onChange={(e) => setRegenerateLength(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="same">Keep Same</option>
                  <option value="shorter">Make Shorter</option>
                  <option value="longer">Make Longer</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setRegenerateModalSection(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerateSection}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
              >
                {isLoading ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <ContentVersionHistory
          entityType="blog_post"
          entityId={blogPost.id}
          onClose={() => setShowVersionHistory(false)}
          onRestore={() => {
            // Reload the blog post
            window.location.reload();
          }}
        />
      )}

      {/* Paragraph History Popover */}
      {showParagraphHistory && (
        <div className="relative">
          <ParagraphHistory
            blogPostId={blogPost.id}
            sectionId={showParagraphHistory.sectionId}
            paragraphIndex={showParagraphHistory.paragraphIndex}
            onClose={() => setShowParagraphHistory(null)}
          />
        </div>
      )}
    </div>
  );
};