import React, { useState, useEffect } from 'react';
import { WriterProfile, WriterTone, WriterStyle } from '@internal-marketing-content-app/shared';
import { SocialPlatformSelector } from './SocialPlatformSelector';

interface WriterProfileFormProps {
  profile?: WriterProfile;
  companyId: string;
  userId: string;
  onSave: (profile: Partial<WriterProfile>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const toneOptions: WriterTone[] = ['Professional', 'Casual', 'Technical', 'Inspirational', 'Friendly'];
const styleOptions: WriterStyle[] = ['Informative', 'Persuasive', 'Educational', 'Entertaining', 'Analytical'];


const contentFocusOptions = [
  'Industry News', 'Product Updates', 'Educational Content', 'Behind the Scenes',
  'Customer Stories', 'Thought Leadership', 'Company Culture', 'Technology Trends',
  'Best Practices', 'Case Studies', 'How-to Guides', 'Industry Analysis'
];

export const WriterProfileForm: React.FC<WriterProfileFormProps> = ({
  profile,
  companyId,
  userId,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    position: profile?.position || '',
    tone: profile?.tone || 'Professional' as WriterTone,
    style: profile?.style || 'Informative' as WriterStyle,
    targetAudience: profile?.targetAudience || '',
    contentFocusAreas: profile?.contentFocusAreas || [],
    socialPlatforms: profile?.socialPlatforms || [],
    companyFocusTips: profile?.companyFocusTips || [],
    isCustom: profile?.isCustom ?? true,
    isActive: profile?.isActive ?? true
  });

  const [newTip, setNewTip] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleAddTip = () => {
    if (newTip.trim()) {
      setFormData(prev => ({
        ...prev,
        companyFocusTips: [...prev.companyFocusTips, newTip.trim()]
      }));
      setNewTip('');
    }
  };

  const handleRemoveTip = (index: number) => {
    setFormData(prev => ({
      ...prev,
      companyFocusTips: prev.companyFocusTips.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profileData = {
      ...formData,
      companyId,
      userId
    };
    await onSave(profileData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">
        {profile ? 'Edit Writer Profile' : 'Create Writer Profile'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Content Strategist, Social Media Manager"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position/Role
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Marketing Manager, Content Lead"
              required
            />
          </div>
        </div>

        {/* Writing Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Writing Tone
            </label>
            <select
              value={formData.tone}
              onChange={(e) => handleInputChange('tone', e.target.value as WriterTone)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {toneOptions.map(tone => (
                <option key={tone} value={tone}>{tone}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Writing Style
            </label>
            <select
              value={formData.style}
              onChange={(e) => handleInputChange('style', e.target.value as WriterStyle)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {styleOptions.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience
          </label>
          <textarea
            value={formData.targetAudience}
            onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Describe your target audience (e.g., B2B decision makers, tech enthusiasts, small business owners)"
            required
          />
        </div>

        {/* Content Focus Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Focus Areas
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {contentFocusOptions.map(area => (
              <label key={area} className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.contentFocusAreas.includes(area)}
                  onChange={() => handleArrayToggle('contentFocusAreas', area)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{area}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Social Platforms */}
        <SocialPlatformSelector
          selectedPlatforms={formData.socialPlatforms}
          onPlatformsChange={(platforms) => handleInputChange('socialPlatforms', platforms)}
          disabled={isLoading}
        />

        {/* Company Focus Tips */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Focus Tips
          </label>
          <div className="space-y-2">
            {formData.companyFocusTips.map((tip, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <span className="flex-1 text-sm">{tip}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTip(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                placeholder="Add a company focus tip..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddTip}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Add Tip
              </button>
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Active Profile</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};