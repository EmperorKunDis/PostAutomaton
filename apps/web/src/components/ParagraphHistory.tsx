import React, { useState, useEffect } from 'react';
import { versionControlService } from '../services/versionControlService';
import {
  ContentRevision,
  ChangeSource
} from '@internal-marketing-content-app/shared';

interface ParagraphHistoryProps {
  blogPostId: string;
  sectionId: string;
  paragraphIndex: number;
  onClose: () => void;
}

export const ParagraphHistory: React.FC<ParagraphHistoryProps> = ({
  blogPostId,
  sectionId,
  paragraphIndex,
  onClose
}) => {
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRevision, setSelectedRevision] = useState<ContentRevision | null>(null);

  useEffect(() => {
    loadParagraphHistory();
  }, [blogPostId, sectionId, paragraphIndex]);

  const loadParagraphHistory = async () => {
    setLoading(true);
    try {
      const response = await versionControlService.getContentHistory({
        entityType: 'blog_post',
        entityId: blogPostId,
        sectionId,
        paragraphIndex
      });
      setRevisions(response.revisions);
    } catch (error) {
      console.error('Failed to load paragraph history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeSourceStyle = (source: ChangeSource) => {
    switch (source) {
      case 'ai_generated':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'human_edit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="absolute right-0 top-8 w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm">Loading history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-8 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Paragraph History</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">{revisions.length} changes</p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {revisions.length === 0 ? (
          <p className="p-4 text-sm text-gray-500 text-center">No changes recorded for this paragraph</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {revisions.map((revision) => (
              <div
                key={revision.id}
                className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedRevision?.id === revision.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedRevision(revision)}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${getChangeSourceStyle(revision.changeSource)}`}>
                    {revision.changeSource.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(revision.changedAt)}</span>
                </div>
                
                {revision.changeNotes && (
                  <p className="text-xs text-gray-600 mt-1 mb-2">{revision.changeNotes}</p>
                )}

                <div className="text-xs">
                  <p className="font-medium text-gray-700 mb-1">Change:</p>
                  {renderDiff(revision)}
                </div>

                {revision.aiPrompt && (
                  <div className="mt-2 p-2 bg-purple-50 rounded text-xs">
                    <p className="font-medium text-purple-700 mb-1">AI Prompt:</p>
                    <p className="text-purple-600">{revision.aiPrompt}</p>
                    {revision.aiModel && (
                      <p className="text-purple-500 mt-1">Model: {revision.aiModel}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRevision && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Full Content Comparison</h4>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Before:</p>
              <div className="p-2 bg-red-50 rounded text-xs text-red-900 max-h-32 overflow-y-auto">
                {selectedRevision.previousContent}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">After:</p>
              <div className="p-2 bg-green-50 rounded text-xs text-green-900 max-h-32 overflow-y-auto">
                {selectedRevision.newContent}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderDiff(revision: ContentRevision) {
    if (!revision.contentDiff?.changes) {
      return <p className="text-gray-500">No diff available</p>;
    }

    return (
      <div className="space-y-1">
        {revision.contentDiff.changes.map((change: any, index: number) => {
          if (change.removed) {
            return (
              <div key={index} className="bg-red-50 p-1 rounded">
                <span className="text-red-600 line-through">{change.value}</span>
              </div>
            );
          }
          if (change.added) {
            return (
              <div key={index} className="bg-green-50 p-1 rounded">
                <span className="text-green-600">{change.value}</span>
              </div>
            );
          }
          // Unchanged text - show truncated
          const text = change.value.length > 50 
            ? change.value.substring(0, 25) + '...' + change.value.substring(change.value.length - 25)
            : change.value;
          return (
            <span key={index} className="text-gray-600 text-xs">{text}</span>
          );
        })}
      </div>
    );
  }
};