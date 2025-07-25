import React, { useState, useEffect, useRef } from 'react';
import { 
  Comment, 
  CommentEntityType,
  CreateCommentRequest 
} from '@internal-marketing-content-app/shared';
import { useCommentsStore } from '../stores/commentsStore';
import { useAuthStore } from '../stores/authStore';
import { CommentThread } from './CommentThread';
import { CommentForm } from './CommentForm';
import { MessageSquare, X, Plus } from 'lucide-react';

interface InlineCommentsProps {
  entityType: CommentEntityType;
  entityId: string;
  sectionId?: string;
  paragraphIndex?: number;
  className?: string;
}

export const InlineComments: React.FC<InlineCommentsProps> = ({
  entityType,
  entityId,
  sectionId,
  paragraphIndex,
  className = ''
}) => {
  const {
    commentsByEntity,
    loadingComments,
    showCommentsPanel,
    replyingTo,
    error,
    loadComments,
    createComment,
    setShowCommentsPanel,
    setReplyingTo,
    clearError
  } = useCommentsStore();
  
  const { user } = useAuthStore();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [selectedText, setSelectedText] = useState<{
    text: string;
    start: number;
    end: number;
  } | null>(null);
  
  const commentsRef = useRef<HTMLDivElement>(null);
  const entityKey = `${entityType}:${entityId}`;
  const comments = commentsByEntity[entityKey] || [];
  const isLoading = loadingComments[entityKey] || false;

  // Filter comments for this specific section/paragraph if provided
  const filteredComments = comments.filter(comment => {
    if (sectionId && comment.sectionId !== sectionId) return false;
    if (paragraphIndex !== undefined && comment.paragraphIndex !== paragraphIndex) return false;
    return true;
  });

  useEffect(() => {
    loadComments(entityType, entityId, {
      sectionId,
      paragraphIndex,
      includeResolved: false
    });
  }, [entityType, entityId, sectionId, paragraphIndex]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      setSelectedText({
        text: selection.toString(),
        start: range.startOffset,
        end: range.endOffset
      });
      setShowCommentForm(true);
    }
  };

  const handleCreateComment = async (content: string) => {
    if (!user) return;

    try {
      const request: CreateCommentRequest = {
        entityType,
        entityId,
        sectionId,
        paragraphIndex,
        content,
        parentCommentId: replyingTo?.id,
        selectionStart: selectedText?.start,
        selectionEnd: selectedText?.end,
        selectedText: selectedText?.text
      };

      await createComment(request);
      setShowCommentForm(false);
      setSelectedText(null);
      setReplyingTo(null);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const toggleCommentsPanel = () => {
    setShowCommentsPanel(!showCommentsPanel);
  };

  const commentCount = filteredComments.length + 
    filteredComments.reduce((sum, comment) => sum + (comment.replyCount || 0), 0);

  return (
    <div className={`inline-comments ${className}`}>
      {/* Comment trigger button */}
      <div className="relative">
        <button
          onClick={toggleCommentsPanel}
          onMouseUp={handleTextSelection}
          className={`
            inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors
            ${commentCount > 0 
              ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' 
              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            }
          `}
          title={`${commentCount} comment${commentCount === 1 ? '' : 's'}`}
        >
          <MessageSquare className="w-3 h-3" />
          {commentCount > 0 && <span>{commentCount}</span>}
        </button>

        {/* Add comment button for new comments */}
        {selectedText && (
          <button
            onClick={() => setShowCommentForm(true)}
            className="absolute -top-8 left-0 bg-blue-600 text-white p-1 rounded-md shadow-lg hover:bg-blue-700 transition-colors"
            title="Add comment to selected text"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Comments panel */}
      {showCommentsPanel && (
        <div 
          ref={commentsRef}
          className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-50 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Comments ({commentCount})
            </h3>
            <button
              onClick={() => setShowCommentsPanel(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading comments...</span>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No comments yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Select text to add the first comment
                </p>
              </div>
            ) : (
              filteredComments.map(comment => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  entityType={entityType}
                  entityId={entityId}
                />
              ))
            )}
          </div>

          {/* New comment form */}
          {(showCommentForm || replyingTo) && (
            <div className="border-t border-gray-200 p-4">
              {selectedText && (
                <div className="mb-3 p-2 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-600 mb-1">Selected text:</p>
                  <p className="text-sm text-gray-800 italic">"{selectedText.text}"</p>
                </div>
              )}
              
              {replyingTo && (
                <div className="mb-3 p-2 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-600 mb-1">Replying to {replyingTo.userName}:</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{replyingTo.content}</p>
                </div>
              )}

              <CommentForm
                onSubmit={handleCreateComment}
                onCancel={() => {
                  setShowCommentForm(false);
                  setSelectedText(null);
                  setReplyingTo(null);
                }}
                placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                entityType={entityType}
                entityId={entityId}
              />
            </div>
          )}

          {/* Quick add comment button */}
          {!showCommentForm && !replyingTo && (
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => setShowCommentForm(true)}
                className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Add a comment...
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay when comments panel is open */}
      {showCommentsPanel && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setShowCommentsPanel(false)}
        />
      )}
    </div>
  );
};