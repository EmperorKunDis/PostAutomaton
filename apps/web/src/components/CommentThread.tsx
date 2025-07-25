import React, { useState } from 'react';
import { 
  Comment, 
  CommentEntityType 
} from '@internal-marketing-content-app/shared';
import { useCommentsStore } from '../stores/commentsStore';
import { useAuthStore } from '../stores/authStore';
import { CommentForm } from './CommentForm';
import { 
  MoreHorizontal, 
  Reply, 
  Edit3, 
  Trash2, 
  Check, 
  MessageSquare,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentThreadProps {
  comment: Comment;
  entityType: CommentEntityType;
  entityId: string;
  isReply?: boolean;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  entityType,
  entityId,
  isReply = false
}) => {
  const {
    editingComment,
    updateComment,
    deleteComment,
    resolveComment,
    createComment,
    setReplyingTo,
    setEditingComment
  } = useCommentsStore();
  
  const { user } = useAuthStore();
  const [showActions, setShowActions] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const isAuthor = user?.id === comment.userId;
  const canResolve = user?.role === 'Admin' || user?.role === 'Editor' || isAuthor;
  const isEditing = editingComment?.id === comment.id;
  const isResolved = comment.status === 'resolved';
  const isDeleted = comment.status === 'deleted';

  const handleEdit = () => {
    setEditingComment(comment);
    setShowActions(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(comment.id);
        setShowActions(false);
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  const handleResolve = async () => {
    try {
      await resolveComment(comment.id, !isResolved);
      setShowActions(false);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleReply = () => {
    setReplyingTo(comment);
    setShowReplyForm(true);
    setShowActions(false);
  };

  const handleEditSubmit = async (content: string) => {
    try {
      await updateComment(comment.id, content);
      setEditingComment(null);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleReplySubmit = async (content: string) => {
    try {
      await createComment({
        entityType,
        entityId,
        content,
        parentCommentId: comment.id,
        sectionId: comment.sectionId,
        paragraphIndex: comment.paragraphIndex
      });
      setShowReplyForm(false);
      setReplyingTo(null);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'text-red-600 bg-red-50 border-red-200';
      case 'editor': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'reviewer': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isDeleted) {
    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''} py-2`}>
        <div className="text-sm text-gray-400 italic">
          [Comment deleted]
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map(reply => (
              <CommentThread
                key={reply.id}
                comment={reply}
                entityType={entityType}
                entityId={entityId}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''} group`}>
      <div 
        className={`
          p-3 rounded-lg transition-colors
          ${isResolved 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
          }
        `}
      >
        {/* Comment header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900">
                {comment.userName}
              </span>
              <span className={`
                px-2 py-0.5 text-xs rounded-full border
                ${getRoleColor(comment.userRole)}
              `}>
                {comment.userRole}
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {comment.editedAt && (
                <span className="text-gray-400">(edited)</span>
              )}
            </div>
          </div>

          {/* Actions menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-gray-200 transition-all"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                <button
                  onClick={handleReply}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
                
                {isAuthor && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </>
                )}
                
                {canResolve && (
                  <button
                    onClick={handleResolve}
                    className={`
                      w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2
                      ${isResolved ? 'text-gray-600' : 'text-green-600'}
                    `}
                  >
                    <Check className="w-3 h-3" />
                    {isResolved ? 'Unresolve' : 'Resolve'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected text context */}
        {comment.selectedText && (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-600 mb-1">Commented on:</p>
            <p className="text-sm text-gray-700 italic">"{comment.selectedText}"</p>
          </div>
        )}

        {/* Comment content */}
        {isEditing ? (
          <CommentForm
            initialValue={comment.content}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingComment(null)}
            placeholder="Edit your comment..."
            entityType={entityType}
            entityId={entityId}
            isEditing={true}
          />
        ) : (
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            {comment.content}
          </div>
        )}

        {/* Resolution status */}
        {isResolved && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
            <Check className="w-3 h-3" />
            <span>
              Resolved by {comment.resolver?.name || 'Unknown'} 
              {comment.resolvedAt && ` ${formatDistanceToNow(new Date(comment.resolvedAt), { addSuffix: true })}`}
            </span>
          </div>
        )}

        {/* Reply count and toggle */}
        {comment.replyCount > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            <span>
              {showReplies ? 'Hide' : 'Show'} {comment.replyCount} repl{comment.replyCount === 1 ? 'y' : 'ies'}
            </span>
          </button>
        )}
      </div>

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map(reply => (
            <CommentThread
              key={reply.id}
              comment={reply}
              entityType={entityType}
              entityId={entityId}
              isReply={true}
            />
          ))}
        </div>
      )}

      {/* Reply form */}
      {showReplyForm && (
        <div className="mt-3 ml-4">
          <div className="mb-2 p-2 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-600 mb-1">Replying to {comment.userName}:</p>
            <p className="text-sm text-gray-700 line-clamp-2">{comment.content}</p>
          </div>
          <CommentForm
            onSubmit={handleReplySubmit}
            onCancel={() => {
              setShowReplyForm(false);
              setReplyingTo(null);
            }}
            placeholder="Write a reply..."
            entityType={entityType}
            entityId={entityId}
          />
        </div>
      )}

      {/* Click outside to close actions */}
      {showActions && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};