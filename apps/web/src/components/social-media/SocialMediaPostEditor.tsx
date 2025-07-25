import React, { useState } from 'react';
import { 
  SocialMediaPost, 
  UpdateSocialPostRequest,
  RegenerateSocialPostRequest,
  PLATFORM_CONSTRAINTS
} from '@internal-marketing-content-app/shared';
import { useSocialMediaStore } from '../../stores/socialMediaStore';

interface SocialMediaPostEditorProps {
  post: SocialMediaPost;
  platformName: string;
  platformIcon: string;
}

export const SocialMediaPostEditor: React.FC<SocialMediaPostEditorProps> = ({
  post,
  platformName,
  platformIcon
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [editedHashtags, setEditedHashtags] = useState(post.hashtags.join(' '));
  const [editedCTA, setEditedCTA] = useState(post.callToAction || '');
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateAngle, setRegenerateAngle] = useState(post.angle);
  const [regenerateFocus, setRegenerateFocus] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const { updateSocialPost, regenerateSocialPost, deleteSocialPost, isLoading } = useSocialMediaStore();

  const constraints = PLATFORM_CONSTRAINTS[post.platform];
  const characterCount = editedContent.length;
  const isOverLimit = characterCount > constraints.maxChars;

  const getAngleBadgeColor = (angle: string) => {
    const colors: Record<string, string> = {
      technical: 'bg-blue-100 text-blue-800',
      emotional: 'bg-pink-100 text-pink-800',
      news: 'bg-red-100 text-red-800',
      educational: 'bg-green-100 text-green-800',
      inspirational: 'bg-purple-100 text-purple-800'
    };
    return colors[angle] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      published: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleSave = async () => {
    const request: UpdateSocialPostRequest = {
      postId: post.id,
      content: editedContent,
      hashtags: editedHashtags.split(/\s+/).filter(tag => tag.startsWith('#')),
      callToAction: editedCTA || undefined
    };

    await updateSocialPost(post.id, request);
    setIsEditing(false);
  };

  const handleRegenerate = async () => {
    const request: RegenerateSocialPostRequest = {
      postId: post.id,
      angle: regenerateAngle !== post.angle ? regenerateAngle : undefined,
      focusOn: regenerateFocus || undefined,
      includeMoreEmojis: true
    };

    await regenerateSocialPost(post.id, request);
    setShowRegenerateModal(false);
    setRegenerateFocus('');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deleteSocialPost(post.id);
    }
  };

  const handleApprove = async () => {
    await updateSocialPost(post.id, { postId: post.id, status: 'approved' });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{platformIcon}</span>
          <h3 className="font-medium text-gray-900">{platformName}</h3>
          <span className={`ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getAngleBadgeColor(post.angle)}`}>
            {post.angle}
          </span>
          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(post.status)}`}>
            {post.status}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing && post.status === 'draft' && (
            <button
              onClick={handleApprove}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Approve
            </button>
          )}
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => setShowRegenerateModal(true)}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                Regenerate
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                isOverLimit ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
                {characterCount} / {constraints.maxChars} characters
              </span>
              {post.emojis.length > 0 && (
                <span className="text-xs text-gray-500">
                  Emojis: {post.emojis.join(' ')}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Hashtags
            </label>
            <input
              type="text"
              value={editedHashtags}
              onChange={(e) => setEditedHashtags(e.target.value)}
              placeholder="#hashtag1 #hashtag2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Call to Action
            </label>
            <input
              type="text"
              value={editedCTA}
              onChange={(e) => setEditedCTA(e.target.value)}
              placeholder="Learn more at..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || isOverLimit}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap mb-3">{post.content}</p>
          
          {post.hashtags.length > 0 && (
            <p className="text-sm text-blue-600 mb-2">{post.hashtags.join(' ')}</p>
          )}
          
          {post.callToAction && (
            <p className="text-sm text-gray-600 italic mb-2">{post.callToAction}</p>
          )}

          {/* Visual Concepts */}
          {post.visualConcepts && post.visualConcepts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-3">Visual Content Ideas:</p>
              {post.visualConcepts.map((concept, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">
                        {concept.type === 'video' ? '🎥' : 
                         concept.type === 'carousel' ? '🎠' :
                         concept.type === 'image' ? '🖼️' :
                         concept.type === 'quote_card' ? '💬' :
                         concept.type === 'infographic' ? '📊' : '🎨'}
                      </span>
                      <p className="text-xs font-medium text-gray-700">
                        {concept.type.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    {concept.duration && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {concept.duration}s
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 mb-2">{concept.description}</p>

                  {/* AI Prompt */}
                  {concept.aiPrompt && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-purple-700">AI Image Prompt:</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => alert('AI Image Generation coming soon! Integration with DALL·E, Midjourney, and Canva planned.')}
                            className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                            title="Generate with AI (Coming Soon)"
                          >
                            🤖 Generate
                          </button>
                          <button
                            onClick={() => copyToClipboard(concept.aiPrompt!, `ai-prompt-${index}`)}
                            className="text-xs text-purple-600 hover:text-purple-800 underline"
                          >
                            {copiedText === `ai-prompt-${index}` ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-purple-600 bg-purple-50 p-2 rounded border italic">
                        "{concept.aiPrompt}"
                      </p>
                    </div>
                  )}

                  {/* Video Script */}
                  {concept.script && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-green-700">Video Script:</p>
                        <button
                          onClick={() => copyToClipboard(concept.script!, `script-${index}`)}
                          className="text-xs text-green-600 hover:text-green-800 underline"
                        >
                          {copiedText === `script-${index}` ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
                        <pre className="whitespace-pre-wrap font-sans">{concept.script}</pre>
                      </div>
                    </div>
                  )}

                  {/* Scene Ideas */}
                  {concept.sceneIdeas && concept.sceneIdeas.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-blue-700 mb-1">Scene Breakdown:</p>
                      <div className="bg-blue-50 p-2 rounded border">
                        {concept.sceneIdeas.map((scene, sceneIndex) => (
                          <div key={sceneIndex} className="flex text-xs text-blue-600 mb-1">
                            <span className="font-medium mr-2">{sceneIndex + 1}.</span>
                            <span>{scene}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested CTAs */}
                  {concept.suggestedCTAs && concept.suggestedCTAs.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-orange-700 mb-1">Suggested CTAs:</p>
                      <div className="flex flex-wrap gap-1">
                        {concept.suggestedCTAs.map((cta, ctaIndex) => (
                          <span 
                            key={ctaIndex}
                            className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full"
                          >
                            {cta}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Regenerate Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Regenerate Post
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Angle
                </label>
                <select
                  value={regenerateAngle}
                  onChange={(e) => setRegenerateAngle(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="technical">Technical</option>
                  <option value="emotional">Emotional</option>
                  <option value="news">News</option>
                  <option value="educational">Educational</option>
                  <option value="inspirational">Inspirational</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Focus on (optional)
                </label>
                <input
                  type="text"
                  value={regenerateFocus}
                  onChange={(e) => setRegenerateFocus(e.target.value)}
                  placeholder="Specific aspect to emphasize..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRegenerateModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
              >
                {isLoading ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};