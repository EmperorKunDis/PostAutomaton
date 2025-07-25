import React, { useState, useEffect } from 'react';
import { ContentTopic, GenerateBlogPostRequest } from '@internal-marketing-content-app/shared';
import { useBlogPostStore } from '../stores/blogPostStore';
import { useContentTopicsStore } from '../stores/contentTopicsStore';
import { useCompanyStore } from '../stores/companyStore';

interface BlogPostGenerationFormProps {
  selectedTopic?: ContentTopic;
  onBlogPostGenerated?: (blogPostId: string) => void;
}

export const BlogPostGenerationForm: React.FC<BlogPostGenerationFormProps> = ({
  selectedTopic,
  onBlogPostGenerated
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(selectedTopic?.id || '');
  const [wordCount, setWordCount] = useState<number>(1500);
  const [includeOutline, setIncludeOutline] = useState<boolean>(true);
  const [customInstructions, setCustomInstructions] = useState<string>('');

  const { selectedCompany } = useCompanyStore();
  const { topics, isLoading: topicsLoading, getContentTopics } = useContentTopicsStore();
  const { generateBlogPost, isGenerating, error } = useBlogPostStore();

  useEffect(() => {
    if (selectedCompany && topics.length === 0) {
      getContentTopics(selectedCompany.id);
    }
  }, [selectedCompany, topics.length, getContentTopics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTopicId || !selectedCompany) {
      return;
    }

    try {
      const request: GenerateBlogPostRequest = {
        contentTopicId: selectedTopicId,
        targetWordCount: wordCount,
        includeOutline,
        additionalInstructions: customInstructions.trim() || undefined
      };

      const blogPost = await generateBlogPost(request);
      
      if (onBlogPostGenerated) {
        onBlogPostGenerated(blogPost.id);
      }
    } catch (error) {
      console.error('Failed to generate blog post:', error);
    }
  };

  if (!selectedCompany) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Please select a company first to generate blog posts.</p>
      </div>
    );
  }

  const availableTopics = topics.filter(topic => 
    topic.status === 'planned' || topic.status === 'in_progress'
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate Blog Post</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Topic Selection */}
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
            Content Topic *
          </label>
          <select
            id="topic"
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            required
            disabled={topicsLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">
              {topicsLoading ? 'Loading topics...' : 'Select a content topic'}
            </option>
            {availableTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title} ({new Date(0, topic.plannedMonth - 1).toLocaleString('default', { month: 'long' })} {topic.plannedYear})
              </option>
            ))}
          </select>
          {availableTopics.length === 0 && !topicsLoading && (
            <p className="text-sm text-gray-500 mt-1">
              No available topics found. Create some content topics first.
            </p>
          )}
        </div>

        {/* Selected Topic Details */}
        {selectedTopicId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            {(() => {
              const topic = topics.find(t => t.id === selectedTopicId);
              return topic ? (
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">{topic.title}</h3>
                  <p className="text-blue-800 text-sm mb-2">{topic.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {topic.category.name}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Priority: {topic.priority}
                    </span>
                    {topic.keywords.slice(0, 3).map((keyword, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Target Word Count */}
        <div>
          <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 mb-2">
            Target Word Count
          </label>
          <input
            type="number"
            id="wordCount"
            value={wordCount}
            onChange={(e) => setWordCount(Number(e.target.value))}
            min="500"
            max="5000"
            step="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Recommended: 1200-2000 words for comprehensive blog posts
          </p>
        </div>

        {/* Include Outline */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeOutline"
            checked={includeOutline}
            onChange={(e) => setIncludeOutline(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="includeOutline" className="ml-2 block text-sm text-gray-700">
            Generate detailed outline with sections
          </label>
        </div>

        {/* Custom Instructions */}
        <div>
          <label htmlFor="customInstructions" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Instructions (Optional)
          </label>
          <textarea
            id="customInstructions"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            rows={4}
            placeholder="Add any specific requirements, tone, style preferences, or additional context for the blog post..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isGenerating || !selectedTopicId}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Blog Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};