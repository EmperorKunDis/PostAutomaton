import React, { useState, useEffect } from 'react';
import { 
  GenerateContentTopicsRequest, 
  ContentGoal, 
  TopicCategory,
  CONTENT_GOALS 
} from '@internal-marketing-content-app/shared';
import { useCompanyStore } from '../stores/companyStore';

interface ContentTopicGenerationFormProps {
  onSubmit: (request: GenerateContentTopicsRequest) => Promise<void>;
  categories: TopicCategory[];
  isLoading: boolean;
}

export const ContentTopicGenerationForm: React.FC<ContentTopicGenerationFormProps> = ({
  onSubmit,
  categories,
  isLoading
}) => {
  const { selectedCompany } = useCompanyStore();
  const [formData, setFormData] = useState<GenerateContentTopicsRequest>({
    companyId: '',
    year: new Date().getFullYear(),
    monthlyTopicCount: 4,
    categories: [],
    contentGoals: [],
    includeSeasonal: true,
    focusKeywords: [],
    additionalInstructions: ''
  });

  useEffect(() => {
    if (selectedCompany) {
      setFormData(prev => ({ ...prev, companyId: selectedCompany.id }));
    }
  }, [selectedCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const toggleCategory = (category: TopicCategory) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleGoal = (goal: ContentGoal) => {
    setFormData(prev => ({
      ...prev,
      contentGoals: prev.contentGoals.includes(goal)
        ? prev.contentGoals.filter(g => g !== goal)
        : [...prev.contentGoals, goal]
    }));
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setFormData(prev => ({ ...prev, focusKeywords: keywords }));
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate Annual Content Topics</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900">
              {selectedCompany ? selectedCompany.name : 'No company selected'}
            </div>
            {!selectedCompany && (
              <p className="mt-1 text-sm text-red-600">Please select a company from the dashboard first</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <input
              type="number"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 5}
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Topic Count
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={formData.monthlyTopicCount}
            onChange={(e) => setFormData(prev => ({ ...prev, monthlyTopicCount: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">Number of topics to generate per month</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Content Categories
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map(category => (
              <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>
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
                  checked={formData.contentGoals.includes(goal)}
                  onChange={() => toggleGoal(goal)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {goal.replace(/_/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Focus Keywords
          </label>
          <input
            type="text"
            placeholder="Enter keywords separated by commas"
            onChange={(e) => handleKeywordsChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">Keywords to prioritize in topic generation</p>
        </div>

        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.includeSeasonal}
              onChange={(e) => setFormData(prev => ({ ...prev, includeSeasonal: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include seasonal and holiday topics</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Instructions
          </label>
          <textarea
            rows={3}
            value={formData.additionalInstructions}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalInstructions: e.target.value }))}
            placeholder="Any specific requirements or themes to focus on..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating Topics...' : 'Generate Topics'}
          </button>
        </div>
      </form>
    </div>
  );
};