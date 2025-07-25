import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Comment } from '../database/entities/comment.entity';
import { Notification } from '../database/entities/notification.entity';
import { User } from '../database/entities/user.entity';
import { BlogPost } from '../database/entities/blog-post.entity';
import { BlogPostSection } from '../database/entities/blog-post-section.entity';
import { SocialMediaPost } from '../database/entities/social-media-post.entity';
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
  CommentEntityType,
  CommentStatus,
  NotificationType,
  NotificationStatus,
  MentionUser
} from '@internal-marketing-content-app/shared';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    
    @InjectRepository(User)
    private userRepository: Repository<User>,
    
    @InjectRepository(BlogPost)
    private blogPostRepository: Repository<BlogPost>,
    
    @InjectRepository(BlogPostSection)
    private blogPostSectionRepository: Repository<BlogPostSection>,
    
    @InjectRepository(SocialMediaPost)
    private socialMediaPostRepository: Repository<SocialMediaPost>,
    
    private entityManager: EntityManager
  ) {}

  async createComment(request: CreateCommentRequest, userId: string): Promise<Comment> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate entity exists and user has access
    await this.validateEntityAccess(request.entityType, request.entityId, user.companyId);

    // Validate parent comment if provided
    let parentComment: Comment | null = null;
    if (request.parentCommentId) {
      parentComment = await this.commentRepository.findOne({
        where: { id: request.parentCommentId }
      });
      
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
      
      if (parentComment.entityType !== request.entityType || parentComment.entityId !== request.entityId) {
        throw new BadRequestException('Parent comment must be on the same entity');
      }
    }

    // Extract mentions from content
    const mentions = this.extractMentions(request.content);
    
    // Validate mentioned users exist and have access to the entity
    const mentionedUsers = await this.validateMentions(mentions, user.companyId);

    return await this.entityManager.transaction(async (transactionalEntityManager) => {
      // Create comment
      const comment = transactionalEntityManager.create(Comment, {
        entityType: request.entityType,
        entityId: request.entityId,
        sectionId: request.sectionId,
        paragraphIndex: request.paragraphIndex,
        content: request.content,
        status: 'active' as CommentStatus,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        parentCommentId: request.parentCommentId,
        mentions: mentions,
        selectionStart: request.selectionStart,
        selectionEnd: request.selectionEnd,
        selectedText: request.selectedText,
        replyCount: 0
      });

      const savedComment = await transactionalEntityManager.save(Comment, comment);

      // Update parent comment reply count
      if (parentComment) {
        await transactionalEntityManager.update(Comment, 
          { id: parentComment.id }, 
          { replyCount: () => 'replyCount + 1' }
        );
      }

      // Create notifications for mentions
      if (mentionedUsers.length > 0) {
        await this.createMentionNotifications(
          savedComment,
          mentionedUsers,
          user,
          transactionalEntityManager
        );
      }

      // Create notification for parent comment author if this is a reply
      if (parentComment && parentComment.userId !== user.id) {
        const parentAuthor = await transactionalEntityManager.findOne(User, {
          where: { id: parentComment.userId }
        });

        if (parentAuthor) {
          await this.createCommentReplyNotification(
            savedComment,
            parentComment,
            parentAuthor,
            user,
            transactionalEntityManager
          );
        }
      }

      return savedComment;
    });
  }

  async updateComment(request: UpdateCommentRequest, userId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: request.id },
      relations: ['user']
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    if (comment.status === 'deleted') {
      throw new BadRequestException('Cannot edit deleted comment');
    }

    // Extract new mentions
    const newMentions = this.extractMentions(request.content);
    const oldMentions = comment.mentions || [];
    
    // Find newly added mentions
    const addedMentions = newMentions.filter(mention => !oldMentions.includes(mention));
    
    // Validate new mentions
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company']
    });

    const mentionedUsers = addedMentions.length > 0 
      ? await this.validateMentions(addedMentions, user!.companyId)
      : [];

    return await this.entityManager.transaction(async (transactionalEntityManager) => {
      // Update comment
      await transactionalEntityManager.update(Comment, 
        { id: request.id },
        {
          content: request.content,
          mentions: newMentions,
          editedAt: new Date(),
          status: 'edited' as CommentStatus
        }
      );

      // Create notifications for new mentions
      if (mentionedUsers.length > 0) {
        const updatedComment = await transactionalEntityManager.findOne(Comment, {
          where: { id: request.id }
        });

        await this.createMentionNotifications(
          updatedComment!,
          mentionedUsers,
          user!,
          transactionalEntityManager
        );
      }

      return await transactionalEntityManager.findOne(Comment, {
        where: { id: request.id }
      }) as Comment;
    });
  }

  async resolveComment(request: ResolveCommentRequest, userId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: request.id }
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    const updateData: Partial<Comment> = {
      status: request.resolved ? 'resolved' as CommentStatus : 'active' as CommentStatus,
      resolvedAt: request.resolved ? new Date() : null,
      resolvedBy: request.resolved ? userId : null
    };

    await this.commentRepository.update({ id: request.id }, updateData);

    // Create notification for comment author if resolved by someone else
    if (request.resolved && comment.userId !== userId) {
      const commentAuthor = await this.userRepository.findOne({
        where: { id: comment.userId }
      });

      if (commentAuthor) {
        await this.createCommentResolvedNotification(
          comment,
          commentAuthor,
          user!
        );
      }
    }

    return await this.commentRepository.findOne({
      where: { id: request.id }
    }) as Comment;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user']
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.entityManager.transaction(async (transactionalEntityManager) => {
      // Mark comment as deleted instead of hard delete to preserve threading
      await transactionalEntityManager.update(Comment,
        { id: commentId },
        {
          status: 'deleted' as CommentStatus,
          content: '[Comment deleted]'
        }
      );

      // Update parent comment reply count if this was a reply
      if (comment.parentCommentId) {
        await transactionalEntityManager.update(Comment,
          { id: comment.parentCommentId },
          { replyCount: () => 'replyCount - 1' }
        );
      }
    });
  }

  async getComments(request: CommentsRequest): Promise<CommentsResponse> {
    const queryBuilder = this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'replyUser')
      .where('comment.entityType = :entityType', { entityType: request.entityType })
      .andWhere('comment.entityId = :entityId', { entityId: request.entityId })
      .andWhere('comment.parentCommentId IS NULL'); // Only get top-level comments

    if (request.sectionId) {
      queryBuilder.andWhere('comment.sectionId = :sectionId', { sectionId: request.sectionId });
    }

    if (request.paragraphIndex !== undefined) {
      queryBuilder.andWhere('comment.paragraphIndex = :paragraphIndex', { paragraphIndex: request.paragraphIndex });
    }

    if (!request.includeResolved) {
      queryBuilder.andWhere('comment.status != :resolvedStatus', { resolvedStatus: 'resolved' });
    }

    queryBuilder.andWhere('comment.status != :deletedStatus', { deletedStatus: 'deleted' });

    const page = request.pagination?.page || 1;
    const limit = request.pagination?.limit || 50;
    const offset = (page - 1) * limit;

    queryBuilder
      .orderBy('comment.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    const [comments, totalCount] = await queryBuilder.getManyAndCount();

    return {
      comments,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  }

  async getUserNotifications(userId: string, request: NotificationsRequest): Promise<NotificationsResponse> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.triggerUser', 'triggerUser')
      .leftJoinAndSelect('notification.comment', 'comment')
      .where('notification.userId = :userId', { userId });

    if (request.status) {
      queryBuilder.andWhere('notification.status = :status', { status: request.status });
    }

    if (request.type) {
      queryBuilder.andWhere('notification.type = :type', { type: request.type });
    }

    if (request.entityType) {
      queryBuilder.andWhere('notification.entityType = :entityType', { entityType: request.entityType });
    }

    const page = request.pagination?.page || 1;
    const limit = request.pagination?.limit || 50;
    const offset = (page - 1) * limit;

    queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    const [notifications, totalCount] = await queryBuilder.getManyAndCount();

    // Get unread count
    const unreadCount = await this.notificationRepository.count({
      where: { userId, status: 'unread' as NotificationStatus }
    });

    return {
      notifications,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      unreadCount
    };
  }

  async markNotifications(request: MarkNotificationsRequest, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { 
        id: { $in: request.notificationIds } as any,
        userId 
      },
      { 
        status: request.status,
        readAt: request.status === 'read' ? new Date() : undefined
      }
    );
  }

  async searchMentionUsers(request: CommentMentionRequest, userId: string): Promise<CommentMentionResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.companyId = :companyId', { companyId: user.companyId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere('user.id != :currentUserId', { currentUserId: userId });

    if (request.query) {
      queryBuilder.andWhere('(user.name LIKE :query OR user.email LIKE :query)', {
        query: `%${request.query}%`
      });
    }

    queryBuilder
      .orderBy('user.name', 'ASC')
      .limit(10);

    const users = await queryBuilder.getMany();

    const mentionUsers: MentionUser[] = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role
    }));

    return { users: mentionUsers };
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      const userId = match[2];
      if (!mentions.includes(userId)) {
        mentions.push(userId);
      }
    }

    return mentions;
  }

  private async validateEntityAccess(entityType: CommentEntityType, entityId: string, companyId: string): Promise<void> {
    let entity;

    switch (entityType) {
      case 'blog_post':
        entity = await this.blogPostRepository.findOne({
          where: { id: entityId }
        });
        break;
      case 'blog_post_section':
        entity = await this.blogPostSectionRepository.findOne({
          where: { id: entityId },
          relations: ['blogPost']
        });
        if (entity && entity.blogPost.companyId !== companyId) {
          throw new ForbiddenException('Access denied to this content');
        }
        break;
      case 'social_post':
        entity = await this.socialMediaPostRepository.findOne({
          where: { id: entityId }
        });
        break;
    }

    if (!entity) {
      throw new NotFoundException('Content not found');
    }

    if (entity.companyId && entity.companyId !== companyId) {
      throw new ForbiddenException('Access denied to this content');
    }
  }

  private async validateMentions(mentions: string[], companyId: string): Promise<User[]> {
    if (mentions.length === 0) {
      return [];
    }

    const users = await this.userRepository.find({
      where: {
        id: { $in: mentions } as any,
        companyId,
        isActive: true
      }
    });

    const foundUserIds = users.map(u => u.id);
    const invalidMentions = mentions.filter(id => !foundUserIds.includes(id));

    if (invalidMentions.length > 0) {
      throw new BadRequestException(`Invalid mentions: ${invalidMentions.join(', ')}`);
    }

    return users;
  }

  private async createMentionNotifications(
    comment: Comment,
    mentionedUsers: User[],
    triggerUser: User,
    transactionalEntityManager: EntityManager
  ): Promise<void> {
    const entityTitle = await this.getEntityTitle(comment.entityType, comment.entityId);

    for (const mentionedUser of mentionedUsers) {
      if (mentionedUser.id === triggerUser.id) {
        continue; // Don't notify yourself
      }

      const notification = transactionalEntityManager.create(Notification, {
        type: 'mention' as NotificationType,
        status: 'unread' as NotificationStatus,
        userId: mentionedUser.id,
        triggeredBy: triggerUser.id,
        triggeredByName: triggerUser.name,
        entityType: comment.entityType,
        entityId: comment.entityId,
        entityTitle,
        title: `${triggerUser.name} mentioned you`,
        message: `${triggerUser.name} mentioned you in a comment on "${entityTitle}"`,
        commentId: comment.id,
        commentContent: comment.content.substring(0, 200)
      });

      await transactionalEntityManager.save(Notification, notification);
    }
  }

  private async createCommentReplyNotification(
    reply: Comment,
    parentComment: Comment,
    parentAuthor: User,
    replyAuthor: User,
    transactionalEntityManager: EntityManager
  ): Promise<void> {
    const entityTitle = await this.getEntityTitle(reply.entityType, reply.entityId);

    const notification = transactionalEntityManager.create(Notification, {
      type: 'comment' as NotificationType,
      status: 'unread' as NotificationStatus,
      userId: parentAuthor.id,
      triggeredBy: replyAuthor.id,
      triggeredByName: replyAuthor.name,
      entityType: reply.entityType,
      entityId: reply.entityId,
      entityTitle,
      title: `${replyAuthor.name} replied to your comment`,
      message: `${replyAuthor.name} replied to your comment on "${entityTitle}"`,
      commentId: reply.id,
      commentContent: reply.content.substring(0, 200)
    });

    await transactionalEntityManager.save(Notification, notification);
  }

  private async createCommentResolvedNotification(
    comment: Comment,
    commentAuthor: User,
    resolver: User
  ): Promise<void> {
    const entityTitle = await this.getEntityTitle(comment.entityType, comment.entityId);

    const notification = this.notificationRepository.create({
      type: 'status_change' as NotificationType,
      status: 'unread' as NotificationStatus,
      userId: commentAuthor.id,
      triggeredBy: resolver.id,
      triggeredByName: resolver.name,
      entityType: comment.entityType,
      entityId: comment.entityId,
      entityTitle,
      title: `${resolver.name} resolved your comment`,
      message: `${resolver.name} marked your comment as resolved on "${entityTitle}"`,
      commentId: comment.id,
      commentContent: comment.content.substring(0, 200)
    });

    await this.notificationRepository.save(notification);
  }

  private async getEntityTitle(entityType: CommentEntityType, entityId: string): Promise<string> {
    switch (entityType) {
      case 'blog_post':
        const blogPost = await this.blogPostRepository.findOne({
          where: { id: entityId }
        });
        return blogPost?.title || 'Blog Post';
      
      case 'blog_post_section':
        const section = await this.blogPostSectionRepository.findOne({
          where: { id: entityId },
          relations: ['blogPost']
        });
        return section ? `${section.blogPost.title} - ${section.title}` : 'Blog Post Section';
      
      case 'social_post':
        const socialPost = await this.socialMediaPostRepository.findOne({
          where: { id: entityId }
        });
        return socialPost ? `${socialPost.platform} Post` : 'Social Post';
      
      default:
        return 'Content';
    }
  }
}