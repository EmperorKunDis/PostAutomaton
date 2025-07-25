import React, { useState, useEffect } from 'react';
import { 
  ContentTopic, 
  UpdateContentTopicRequest, 
  TopicCategory,
  CONTENT_GOALS,
  ContentGoal
} from '@internal-marketing-content-app/shared';

interface ContentTopicFormProps {
  topic?: ContentTopic;
  categories: TopicCategory[];
  onSubmit: (data: UpdateContentTopicRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const ContentTopicForm: React.FC<ContentTopicFormProps> = ({
  topic,
  categories,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<UpdateContentTopicRequest>({
    title: topic?.title || '',
    description: topic?.description || '',
    category: topic?.category || categories[0],
    keywords: topic?.keywords || [],
    plannedMonth: topic?.plannedMonth || 1,
    plannedYear: topic?.plannedYear || new Date().getFullYear(),
    priority: topic?.priority || 'medium',
    status: topic?.status || 'planned',
    contentGoals: topic?.contentGoals || [],
    targetAudience: topic?.targetAudience || '',
    estimatedReadingTime: topic?.estimatedReadingTime || 5,
    seasonalRelevance: topic?.seasonalRelevance || [],
    competitorKeywords: topic?.competitorKeywords || []
  });

  const [keywordsInput, setKeywordsInput] = useState(
    topic?.keywords?.join(', ') || ''
  );
  const [competitorKeywordsInput, setCompetitorKeywordsInput] = useState(
    topic?.competitorKeywords?.join(', ') || ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleKeywordsChange = (value: string) => {
    setKeywordsInput(value);
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setFormData(prev => ({ ...prev, keywords }));
  };

  const handleCompetitorKeywordsChange = (value: string) => {
    setCompetitorKeywordsInput(value);
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setFormData(prev => ({ ...prev, competitorKeywords: keywords }));
  };

  const toggleContentGoal = (goal: ContentGoal) => {
    setFormData(prev => ({
      ...prev,
      contentGoals: prev.contentGoals?.includes(goal)
        ? prev.contentGoals.filter(g => g !== goal)
        : [...(prev.contentGoals || []), goal]
    }));
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {topic ? 'Edit Content Topic' : 'Create Content Topic'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category?.id || ''}
              onChange={(e) => {
                const category = categories.find(c => c.id === e.target.value);
                setFormData(prev => ({ ...prev, category: category || categories[0] }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ContentTopic['status'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned Month
            </label>
            <select
              value={formData.plannedMonth}
              onChange={(e) => setFormData(prev => ({ ...prev, plannedMonth: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {MONTHS.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned Year
            </label>
            <input
              type="number"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 5}
              value={formData.plannedYear}
              onChange={(e) => setFormData(prev => ({ ...prev, plannedYear: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Reading Time (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={formData.estimatedReadingTime}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedReadingTime: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience
          </label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
            placeholder="e.g., Small business owners, Marketing professionals, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keywords
          </label>
          <input
            type="text"
            value={keywordsInput}
            onChange={(e) => handleKeywordsChange(e.target.value)}
            placeholder="Enter keywords separated by commas"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Competitor Keywords
          </label>
          <input
            type="text"
            value={competitorKeywordsInput}
            onChange={(e) => handleCompetitorKeywordsChange(e.target.value)}
            placeholder="Enter competitor keywords separated by commas"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Content Goals
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CONTENT_GOALS.map(goal => (
              <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.contentGoals?.includes(goal) || false}
                  onChange={() => toggleContentGoal(goal)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {goal.replace(/_/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : topic ? 'Update Topic' : 'Create Topic'}
          </button>
        </div>
      </form>
    </div>
  );
};