import { 
  CreateCommentRequest,
  UpdateCommentRequest,
  ResolveCommentRequest,
  CommentsRequest,
  CommentsResponse,
  NotificationsRequest,
  NotificationsResponse,
  MarkNotificationsRequest,
  CommentMentionRequest,
  CommentMentionResponse,
  Comment
} from '@internal-marketing-content-app/shared';
import { api } from './api';

class CommentsService {
  async createComment(request: CreateCommentRequest): Promise<Comment> {
    const response = await api.post('/comments', request);
    return response.data;
  }

  async updateComment(commentId: string, request: Omit<UpdateCommentRequest, 'id'>): Promise<Comment> {
    const response = await api.put(`/comments/${commentId}`, request);
    return response.data;
  }

  async resolveComment(commentId: string, resolved: boolean): Promise<Comment> {
    const response = await api.put(`/comments/${commentId}/resolve`, { resolved });
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  }

  async getComments(request: CommentsRequest): Promise<CommentsResponse> {
    const params = new URLSearchParams();
    params.append('entityType', request.entityType);
    params.append('entityId', request.entityId);
    
    if (request.sectionId) {
      params.append('sectionId', request.sectionId);
    }
    
    if (request.paragraphIndex !== undefined) {
      params.append('paragraphIndex', request.paragraphIndex.toString());
    }
    
    if (request.includeResolved !== undefined) {
      params.append('includeResolved', request.includeResolved.toString());
    }
    
    if (request.pagination) {
      params.append('page', request.pagination.page.toString());
      params.append('limit', request.pagination.limit.toString());
    }

    const response = await api.get(`/comments?${params.toString()}`);
    return response.data;
  }

  async getUserNotifications(request: NotificationsRequest): Promise<NotificationsResponse> {
    const params = new URLSearchParams();
    
    if (request.status) {
      params.append('status', request.status);
    }
    
    if (request.type) {
      params.append('type', request.type);
    }
    
    if (request.entityType) {
      params.append('entityType', request.entityType);
    }
    
    if (request.pagination) {
      params.append('page', request.pagination.page.toString());
      params.append('limit', request.pagination.limit.toString());
    }

    const response = await api.get(`/comments/notifications?${params.toString()}`);
    return response.data;
  }

  async markNotifications(request: MarkNotificationsRequest): Promise<void> {
    await api.put('/comments/notifications/mark', request);
  }

  async searchMentionUsers(request: CommentMentionRequest): Promise<CommentMentionResponse> {
    const params = new URLSearchParams();
    params.append('query', request.query);
    params.append('entityType', request.entityType);
    params.append('entityId', request.entityId);
    
    if (request.companyId) {
      params.append('companyId', request.companyId);
    }

    const response = await api.get(`/comments/mentions/search?${params.toString()}`);
    return response.data;
  }
}

export const commentsService = new CommentsService();