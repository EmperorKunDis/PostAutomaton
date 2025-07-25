import { create } from 'zustand';
import { 
  Comment, 
  Notification,
  CommentEntityType,
  CreateCommentRequest,
  CommentsRequest 
} from '@internal-marketing-content-app/shared';
import { commentsService } from '../services/commentsService';

interface CommentsState {
  // Comments data
  commentsByEntity: Record<string, Comment[]>; // key: `${entityType}:${entityId}`
  loadingComments: Record<string, boolean>;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  loadingNotifications: boolean;
  
  // UI state
  showCommentsPanel: boolean;
  selectedComment: Comment | null;
  replyingTo: Comment | null;
  editingComment: Comment | null;
  
  // Error handling
  error: string | null;
  
  // Actions
  loadComments: (entityType: CommentEntityType, entityId: string, options?: Partial<CommentsRequest>) => Promise<void>;
  createComment: (request: CreateCommentRequest) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  resolveComment: (commentId: string, resolved: boolean) => Promise<void>;
  
  // Notifications
  loadNotifications: () => Promise<void>;
  markNotificationsAsRead: (notificationIds: string[]) => Promise<void>;
  
  // UI actions
  setShowCommentsPanel: (show: boolean) => void;
  setSelectedComment: (comment: Comment | null) => void;
  setReplyingTo: (comment: Comment | null) => void;
  setEditingComment: (comment: Comment | null) => void;
  clearError: () => void;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  // Initial state
  commentsByEntity: {},
  loadingComments: {},
  notifications: [],
  unreadCount: 0,
  loadingNotifications: false,
  showCommentsPanel: false,
  selectedComment: null,
  replyingTo: null,
  editingComment: null,
  error: null,

  // Load comments for an entity
  loadComments: async (entityType: CommentEntityType, entityId: string, options = {}) => {
    const entityKey = `${entityType}:${entityId}`;
    
    try {
      set(state => ({
        loadingComments: { ...state.loadingComments, [entityKey]: true },
        error: null
      }));

      const request: CommentsRequest = {
        entityType,
        entityId,
        ...options
      };

      const response = await commentsService.getComments(request);
      
      set(state => ({
        commentsByEntity: {
          ...state.commentsByEntity,
          [entityKey]: response.comments
        },
        loadingComments: { ...state.loadingComments, [entityKey]: false }
      }));
    } catch (error: any) {
      set(state => ({
        loadingComments: { ...state.loadingComments, [entityKey]: false },
        error: error.response?.data?.message || 'Failed to load comments'
      }));
    }
  },

  // Create a new comment
  createComment: async (request: CreateCommentRequest) => {
    try {
      set({ error: null });
      
      const newComment = await commentsService.createComment(request);
      const entityKey = `${request.entityType}:${request.entityId}`;
      
      set(state => {
        const existingComments = state.commentsByEntity[entityKey] || [];
        
        if (request.parentCommentId) {
          // Add as reply to existing comment
          const updatedComments = existingComments.map(comment => {
            if (comment.id === request.parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment],
                replyCount: comment.replyCount + 1
              };
            }
            return comment;
          });
          
          return {
            commentsByEntity: {
              ...state.commentsByEntity,
              [entityKey]: updatedComments
            },
            replyingTo: null
          };
        } else {
          // Add as top-level comment
          return {
            commentsByEntity: {
              ...state.commentsByEntity,
              [entityKey]: [newComment, ...existingComments]
            }
          };
        }
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create comment'
      });
      throw error;
    }
  },

  // Update comment content
  updateComment: async (commentId: string, content: string) => {
    try {
      set({ error: null });
      
      const updatedComment = await commentsService.updateComment(commentId, { content });
      
      set(state => {
        const newCommentsByEntity = { ...state.commentsByEntity };
        
        // Find and update the comment in all entities
        Object.keys(newCommentsByEntity).forEach(entityKey => {
          newCommentsByEntity[entityKey] = newCommentsByEntity[entityKey].map(comment => {
            if (comment.id === commentId) {
              return updatedComment;
            }
            
            // Check replies
            if (comment.replies) {
              const updatedReplies = comment.replies.map(reply => 
                reply.id === commentId ? updatedComment : reply
              );
              return { ...comment, replies: updatedReplies };
            }
            
            return comment;
          });
        });
        
        return {
          commentsByEntity: newCommentsByEntity,
          editingComment: null
        };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update comment'
      });
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId: string) => {
    try {
      set({ error: null });
      
      await commentsService.deleteComment(commentId);
      
      set(state => {
        const newCommentsByEntity = { ...state.commentsByEntity };
        
        // Remove comment from all entities
        Object.keys(newCommentsByEntity).forEach(entityKey => {
          newCommentsByEntity[entityKey] = newCommentsByEntity[entityKey].filter(comment => {
            if (comment.id === commentId) {
              return false;
            }
            
            // Remove from replies and update reply count
            if (comment.replies) {
              const originalReplyCount = comment.replies.length;
              comment.replies = comment.replies.filter(reply => reply.id !== commentId);
              if (comment.replies.length < originalReplyCount) {
                comment.replyCount = Math.max(0, comment.replyCount - 1);
              }
            }
            
            return true;
          });
        });
        
        return {
          commentsByEntity: newCommentsByEntity,
          selectedComment: state.selectedComment?.id === commentId ? null : state.selectedComment
        };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete comment'
      });
      throw error;
    }
  },

  // Resolve/unresolve comment
  resolveComment: async (commentId: string, resolved: boolean) => {
    try {
      set({ error: null });
      
      const updatedComment = await commentsService.resolveComment(commentId, resolved);
      
      set(state => {
        const newCommentsByEntity = { ...state.commentsByEntity };
        
        // Update comment in all entities
        Object.keys(newCommentsByEntity).forEach(entityKey => {
          newCommentsByEntity[entityKey] = newCommentsByEntity[entityKey].map(comment => {
            if (comment.id === commentId) {
              return updatedComment;
            }
            
            // Check replies
            if (comment.replies) {
              const updatedReplies = comment.replies.map(reply => 
                reply.id === commentId ? updatedComment : reply
              );
              return { ...comment, replies: updatedReplies };
            }
            
            return comment;
          });
        });
        
        return { commentsByEntity: newCommentsByEntity };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to resolve comment'
      });
      throw error;
    }
  },

  // Load user notifications
  loadNotifications: async () => {
    try {
      set({ loadingNotifications: true, error: null });
      
      const response = await commentsService.getUserNotifications({
        pagination: { page: 1, limit: 50 }
      });
      
      set({
        notifications: response.notifications,
        unreadCount: response.unreadCount,
        loadingNotifications: false
      });
    } catch (error: any) {
      set({
        loadingNotifications: false,
        error: error.response?.data?.message || 'Failed to load notifications'
      });
    }
  },

  // Mark notifications as read
  markNotificationsAsRead: async (notificationIds: string[]) => {
    try {
      set({ error: null });
      
      await commentsService.markNotifications({
        notificationIds,
        status: 'read'
      });
      
      set(state => ({
        notifications: state.notifications.map(notification =>
          notificationIds.includes(notification.id)
            ? { ...notification, status: 'read' as const, readAt: new Date() }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - notificationIds.length)
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to mark notifications as read'
      });
    }
  },

  // UI actions
  setShowCommentsPanel: (show: boolean) => {
    set({ showCommentsPanel: show });
  },

  setSelectedComment: (comment: Comment | null) => {
    set({ selectedComment: comment });
  },

  setReplyingTo: (comment: Comment | null) => {
    set({ replyingTo: comment });
  },

  setEditingComment: (comment: Comment | null) => {
    set({ editingComment: comment });
  },

  clearError: () => {
    set({ error: null });
  }
}));