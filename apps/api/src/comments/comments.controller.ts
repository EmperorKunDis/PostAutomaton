import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(
    @Body() request: CreateCommentRequest,
    @Request() req: any
  ): Promise<Comment> {
    return this.commentsService.createComment(request, req.user.id);
  }

  @Put(':id')
  async updateComment(
    @Param('id') commentId: string,
    @Body() request: Omit<UpdateCommentRequest, 'id'>,
    @Request() req: any
  ): Promise<Comment> {
    return this.commentsService.updateComment(
      { ...request, id: commentId },
      req.user.id
    );
  }

  @Put(':id/resolve')
  async resolveComment(
    @Param('id') commentId: string,
    @Body() request: Omit<ResolveCommentRequest, 'id'>,
    @Request() req: any
  ): Promise<Comment> {
    return this.commentsService.resolveComment(
      { ...request, id: commentId },
      req.user.id
    );
  }

  @Delete(':id')
  async deleteComment(
    @Param('id') commentId: string,
    @Request() req: any
  ): Promise<{ success: boolean }> {
    await this.commentsService.deleteComment(commentId, req.user.id);
    return { success: true };
  }

  @Get()
  async getComments(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Query('sectionId') sectionId?: string,
    @Query('paragraphIndex') paragraphIndex?: number,
    @Query('includeResolved') includeResolved?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<CommentsResponse> {
    const request: CommentsRequest = {
      entityType: entityType as any,
      entityId,
      sectionId,
      paragraphIndex: paragraphIndex ? Number(paragraphIndex) : undefined,
      includeResolved: includeResolved === 'true',
      pagination: page || limit ? {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50
      } : undefined
    };

    return this.commentsService.getComments(request);
  }

  @Get('notifications')
  async getUserNotifications(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('entityType') entityType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Request() req: any
  ): Promise<NotificationsResponse> {
    const request: NotificationsRequest = {
      status: status as any,
      type: type as any,
      entityType: entityType as any,
      pagination: page || limit ? {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50
      } : undefined
    };

    return this.commentsService.getUserNotifications(req.user.id, request);
  }

  @Put('notifications/mark')
  async markNotifications(
    @Body() request: MarkNotificationsRequest,
    @Request() req: any
  ): Promise<{ success: boolean }> {
    await this.commentsService.markNotifications(request, req.user.id);
    return { success: true };
  }

  @Get('mentions/search')
  async searchMentionUsers(
    @Query('query') query: string,
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Query('companyId') companyId?: string,
    @Request() req: any
  ): Promise<CommentMentionResponse> {
    const request: CommentMentionRequest = {
      query,
      entityType: entityType as any,
      entityId,
      companyId
    };

    return this.commentsService.searchMentionUsers(request, req.user.id);
  }
}