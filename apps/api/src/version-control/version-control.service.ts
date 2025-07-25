import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ContentVersion } from '../database/entities/content-version.entity';
import { ContentRevision } from '../database/entities/content-revision.entity';
import { BlogPost } from '../database/entities/blog-post.entity';
import { BlogPostSection } from '../database/entities/blog-post-section.entity';
import { SocialMediaPost } from '../database/entities/social-media-post.entity';
import { ReusableSnippet } from '../database/entities/reusable-snippet.entity';
import { User } from '../database/entities/user.entity';
import {
  ContentEntityType,
  ChangeType,
  ChangeSource,
  ContentHistoryRequest,
  ContentHistoryResponse,
  VersionComparisonRequest,
  VersionComparisonResponse,
  RestoreVersionRequest,
  ContentVersion as IContentVersion
} from '@internal-marketing-content-app/shared';
import * as diff from 'diff';

@Injectable()
export class VersionControlService {
  constructor(
    @InjectRepository(ContentVersion)
    private contentVersionRepository: Repository<ContentVersion>,
    @InjectRepository(ContentRevision)
    private contentRevisionRepository: Repository<ContentRevision>,
    @InjectRepository(BlogPost)
    private blogPostRepository: Repository<BlogPost>,
    @InjectRepository(BlogPostSection)
    private blogPostSectionRepository: Repository<BlogPostSection>,
    @InjectRepository(SocialMediaPost)
    private socialMediaPostRepository: Repository<SocialMediaPost>,
    @InjectRepository(ReusableSnippet)
    private reusableSnippetRepository: Repository<ReusableSnippet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource
  ) {}

  async trackChange(
    entityType: ContentEntityType,
    entityId: string,
    changeType: ChangeType,
    changeSource: ChangeSource,
    userId: string,
    contentSnapshot: any,
    changeDescription?: string,
    previousContent?: any
  ): Promise<ContentVersion> {
    // Get the latest version number
    const latestVersion = await this.contentVersionRepository.findOne({
      where: { entityType, entityId },
      order: { versionNumber: 'DESC' }
    });

    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
    
    // Create content diff if previous content exists
    let contentDiff = null;
    if (previousContent) {
      contentDiff = this.createContentDiff(previousContent, contentSnapshot);
    }

    // Create new version
    const version = this.contentVersionRepository.create({
      entityType,
      entityId,
      versionNumber,
      changeType,
      changeSource,
      changedBy: userId,
      changeDescription,
      contentSnapshot,
      contentDiff,
      previousVersionId: latestVersion?.id
    });

    const savedVersion = await this.contentVersionRepository.save(version);

    // Update previous version's nextVersionId
    if (latestVersion) {
      await this.contentVersionRepository.update(
        latestVersion.id,
        { nextVersionId: savedVersion.id }
      );
    }

    return savedVersion;
  }

  async trackRevision(
    entityType: ContentEntityType,
    entityId: string,
    changeType: ChangeType,
    changeSource: ChangeSource,
    userId: string,
    previousContent: string,
    newContent: string,
    changeNotes?: string,
    sectionId?: string,
    paragraphIndex?: number,
    aiPrompt?: string,
    aiModel?: string
  ): Promise<ContentRevision> {
    // Get version numbers
    const fromVersion = await this.getLatestVersionNumber(entityType, entityId) - 1;
    const toVersion = fromVersion + 1;

    const contentDiff = this.createTextDiff(previousContent, newContent);

    const revision = this.contentRevisionRepository.create({
      blogPostId: entityType === 'blog_post' ? entityId : undefined,
      socialPostId: entityType === 'social_post' ? entityId : undefined,
      snippetId: entityType === 'snippet' ? entityId : undefined,
      sectionId,
      paragraphIndex,
      fromVersion: Math.max(1, fromVersion),
      toVersion,
      changeType,
      changeSource,
      changedBy: userId,
      previousContent,
      newContent,
      contentDiff,
      changeNotes,
      aiPrompt,
      aiModel
    });

    return await this.contentRevisionRepository.save(revision);
  }

  async getContentHistory(
    request: ContentHistoryRequest
  ): Promise<ContentHistoryResponse> {
    const { entityType, entityId, sectionId, paragraphIndex, filters, pagination } = request;
    
    // Build version query
    const versionQuery = this.contentVersionRepository
      .createQueryBuilder('version')
      .leftJoinAndSelect('version.user', 'user')
      .where('version.entityType = :entityType', { entityType })
      .andWhere('version.entityId = :entityId', { entityId })
      .orderBy('version.versionNumber', 'DESC');

    // Build revision query
    const revisionQuery = this.contentRevisionRepository
      .createQueryBuilder('revision')
      .leftJoinAndSelect('revision.user', 'user');

    // Apply entity-specific filters
    if (entityType === 'blog_post') {
      revisionQuery.andWhere('revision.blogPostId = :entityId', { entityId });
      if (sectionId) {
        revisionQuery.andWhere('revision.sectionId = :sectionId', { sectionId });
      }
      if (paragraphIndex !== undefined) {
        revisionQuery.andWhere('revision.paragraphIndex = :paragraphIndex', { paragraphIndex });
      }
    } else if (entityType === 'social_post') {
      revisionQuery.andWhere('revision.socialPostId = :entityId', { entityId });
    } else if (entityType === 'snippet') {
      revisionQuery.andWhere('revision.snippetId = :entityId', { entityId });
    }

    // Apply filters
    if (filters?.changeSource?.length) {
      versionQuery.andWhere('version.changeSource IN (:...sources)', { sources: filters.changeSource });
      revisionQuery.andWhere('revision.changeSource IN (:...sources)', { sources: filters.changeSource });
    }

    if (filters?.changedBy?.length) {
      versionQuery.andWhere('version.changedBy IN (:...users)', { users: filters.changedBy });
      revisionQuery.andWhere('revision.changedBy IN (:...users)', { users: filters.changedBy });
    }

    if (filters?.dateRange) {
      versionQuery.andWhere('version.changedAt BETWEEN :from AND :to', {
        from: filters.dateRange.from,
        to: filters.dateRange.to
      });
      revisionQuery.andWhere('revision.changedAt BETWEEN :from AND :to', {
        from: filters.dateRange.from,
        to: filters.dateRange.to
      });
    }

    revisionQuery.orderBy('revision.changedAt', 'DESC');

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    versionQuery.limit(limit).offset(offset);
    revisionQuery.limit(limit).offset(offset);

    const [versions, versionsCount] = await versionQuery.getManyAndCount();
    const [revisions, revisionsCount] = await revisionQuery.getManyAndCount();

    // Get entity title
    const entityTitle = await this.getEntityTitle(entityType, entityId);

    // Calculate summary stats
    const summary = await this.calculateHistorySummary(entityType, entityId);

    return {
      entityType,
      entityId,
      entityTitle,
      versions: versions.map(v => this.mapVersionToInterface(v)),
      revisions: revisions.map(r => this.mapRevisionToInterface(r)),
      totalVersions: versionsCount,
      totalPages: Math.ceil(versionsCount / limit),
      currentPage: page,
      summary
    };
  }

  async compareVersions(
    request: VersionComparisonRequest
  ): Promise<VersionComparisonResponse> {
    const { entityType, entityId, fromVersion, toVersion } = request;

    // Get the versions
    const fromVersionEntity = await this.contentVersionRepository.findOne({
      where: { entityType, entityId, versionNumber: fromVersion },
      relations: ['user']
    });

    const toVersionEntity = await this.contentVersionRepository.findOne({
      where: { entityType, entityId, versionNumber: toVersion },
      relations: ['user']
    });

    if (!fromVersionEntity || !toVersionEntity) {
      throw new NotFoundException('One or both versions not found');
    }

    // Get entity title
    const entityTitle = await this.getEntityTitle(entityType, entityId);

    // Calculate diff
    const diffResult = this.calculateVersionDiff(
      fromVersionEntity.contentSnapshot,
      toVersionEntity.contentSnapshot
    );

    // Calculate summary
    const summary = await this.calculateComparisonSummary(
      entityType,
      entityId,
      fromVersion,
      toVersion
    );

    return {
      entityType,
      entityId,
      entityTitle,
      fromVersion: this.mapVersionToInterface(fromVersionEntity),
      toVersion: this.mapVersionToInterface(toVersionEntity),
      additions: diffResult.additions,
      deletions: diffResult.deletions,
      modifications: diffResult.modifications,
      diff: diffResult.diff,
      summary
    };
  }

  async restoreVersion(
    request: RestoreVersionRequest,
    userId: string
  ): Promise<void> {
    const { entityType, entityId, targetVersion, restoreNotes } = request;

    // Get the target version
    const versionToRestore = await this.contentVersionRepository.findOne({
      where: { entityType, entityId, versionNumber: targetVersion }
    });

    if (!versionToRestore) {
      throw new NotFoundException('Version not found');
    }

    // Get current content
    const currentContent = await this.getCurrentContent(entityType, entityId);

    // Start transaction
    await this.dataSource.manager.transaction(async transactionalEntityManager => {
      // Update the entity with the restored content
      await this.updateEntity(
        entityType,
        entityId,
        versionToRestore.contentSnapshot,
        transactionalEntityManager
      );

      // Track the restore as a new version
      await this.trackChange(
        entityType,
        entityId,
        'restore' as ChangeType,
        'human_edit' as ChangeSource,
        userId,
        versionToRestore.contentSnapshot,
        `Restored to version ${targetVersion}. ${restoreNotes || ''}`,
        currentContent
      );

      // Create a revision record
      if (currentContent && typeof currentContent === 'object' && 'content' in currentContent) {
        await this.trackRevision(
          entityType,
          entityId,
          'restore' as ChangeType,
          'human_edit' as ChangeSource,
          userId,
          JSON.stringify(currentContent),
          JSON.stringify(versionToRestore.contentSnapshot),
          `Restored to version ${targetVersion}. ${restoreNotes || ''}`
        );
      }
    });
  }

  // Helper methods
  private async getLatestVersionNumber(
    entityType: ContentEntityType,
    entityId: string
  ): Promise<number> {
    const latest = await this.contentVersionRepository.findOne({
      where: { entityType, entityId },
      order: { versionNumber: 'DESC' }
    });
    return latest ? latest.versionNumber : 0;
  }

  private async getEntityTitle(
    entityType: ContentEntityType,
    entityId: string
  ): Promise<string> {
    switch (entityType) {
      case 'blog_post':
        const blogPost = await this.blogPostRepository.findOne({
          where: { id: entityId }
        });
        return blogPost?.title || 'Unknown Blog Post';
      
      case 'social_post':
        const socialPost = await this.socialMediaPostRepository.findOne({
          where: { id: entityId }
        });
        return socialPost ? `${socialPost.platform} Post` : 'Unknown Social Post';
      
      case 'snippet':
        const snippet = await this.reusableSnippetRepository.findOne({
          where: { id: entityId }
        });
        return snippet?.title || 'Unknown Snippet';
      
      default:
        return 'Unknown Content';
    }
  }

  private async getCurrentContent(
    entityType: ContentEntityType,
    entityId: string
  ): Promise<any> {
    switch (entityType) {
      case 'blog_post':
        return await this.blogPostRepository.findOne({
          where: { id: entityId },
          relations: ['sections']
        });
      
      case 'social_post':
        return await this.socialMediaPostRepository.findOne({
          where: { id: entityId }
        });
      
      case 'snippet':
        return await this.reusableSnippetRepository.findOne({
          where: { id: entityId }
        });
      
      default:
        return null;
    }
  }

  private async updateEntity(
    entityType: ContentEntityType,
    entityId: string,
    contentSnapshot: any,
    transactionalEntityManager: any
  ): Promise<void> {
    switch (entityType) {
      case 'blog_post':
        await transactionalEntityManager.update(BlogPost, entityId, contentSnapshot);
        break;
      
      case 'social_post':
        await transactionalEntityManager.update(SocialMediaPost, entityId, contentSnapshot);
        break;
      
      case 'snippet':
        await transactionalEntityManager.update(ReusableSnippet, entityId, contentSnapshot);
        break;
    }
  }

  private createContentDiff(oldContent: any, newContent: any): any {
    // Simple JSON diff - in production, use a proper diff library
    const changes = [];
    
    // Compare top-level fields
    for (const key in newContent) {
      if (oldContent[key] !== newContent[key]) {
        changes.push({
          field: key,
          oldValue: oldContent[key],
          newValue: newContent[key]
        });
      }
    }
    
    return changes;
  }

  private createTextDiff(oldText: string, newText: string): any {
    const changes = diff.diffLines(oldText, newText);
    return {
      changes: changes.map(change => ({
        value: change.value,
        added: change.added,
        removed: change.removed,
        count: change.count
      }))
    };
  }

  private calculateVersionDiff(oldContent: any, newContent: any): any {
    const additions = 0;
    const deletions = 0;
    const modifications = 0;
    const diffItems = [];

    // Implement proper diff calculation
    // This is a simplified version
    for (const key in newContent) {
      if (!(key in oldContent)) {
        diffItems.push({
          type: 'added',
          field: key,
          newValue: newContent[key]
        });
      } else if (oldContent[key] !== newContent[key]) {
        diffItems.push({
          type: 'modified',
          field: key,
          oldValue: oldContent[key],
          newValue: newContent[key]
        });
      }
    }

    for (const key in oldContent) {
      if (!(key in newContent)) {
        diffItems.push({
          type: 'removed',
          field: key,
          oldValue: oldContent[key]
        });
      }
    }

    return {
      additions: diffItems.filter(d => d.type === 'added').length,
      deletions: diffItems.filter(d => d.type === 'removed').length,
      modifications: diffItems.filter(d => d.type === 'modified').length,
      diff: diffItems
    };
  }

  private async calculateHistorySummary(
    entityType: ContentEntityType,
    entityId: string
  ): Promise<any> {
    const versions = await this.contentVersionRepository.find({
      where: { entityType, entityId },
      relations: ['user'],
      order: { changedAt: 'ASC' }
    });

    const aiChanges = versions.filter(v => v.changeSource === 'ai_generated').length;
    const humanChanges = versions.filter(v => v.changeSource === 'human_edit').length;

    // Group by user
    const userChanges = new Map<string, any>();
    for (const version of versions) {
      const userId = version.changedBy;
      if (!userChanges.has(userId)) {
        userChanges.set(userId, {
          userId,
          userName: version.user?.name || 'Unknown User',
          changeCount: 0,
          lastChange: version.changedAt
        });
      }
      const userData = userChanges.get(userId);
      userData.changeCount++;
      userData.lastChange = version.changedAt;
    }

    return {
      firstVersion: versions[0]?.changedAt || new Date(),
      lastModified: versions[versions.length - 1]?.changedAt || new Date(),
      totalChanges: versions.length,
      aiChanges,
      humanChanges,
      contributors: Array.from(userChanges.values())
    };
  }

  private async calculateComparisonSummary(
    entityType: ContentEntityType,
    entityId: string,
    fromVersion: number,
    toVersion: number
  ): Promise<any> {
    const versions = await this.contentVersionRepository
      .createQueryBuilder('version')
      .where('version.entityType = :entityType', { entityType })
      .andWhere('version.entityId = :entityId', { entityId })
      .andWhere('version.versionNumber >= :fromVersion', { fromVersion })
      .andWhere('version.versionNumber <= :toVersion', { toVersion })
      .getMany();

    const changesBySource = {
      ai_generated: 0,
      human_edit: 0,
      system: 0,
      import: 0
    };

    const changesByUser = {};

    for (const version of versions) {
      changesBySource[version.changeSource]++;
      changesByUser[version.changedBy] = (changesByUser[version.changedBy] || 0) + 1;
    }

    return {
      totalChanges: versions.length,
      changesBySource,
      changesByUser
    };
  }

  private mapVersionToInterface(version: ContentVersion): IContentVersion {
    return {
      id: version.id,
      entityType: version.entityType,
      entityId: version.entityId,
      versionNumber: version.versionNumber,
      changeType: version.changeType,
      changeSource: version.changeSource,
      changedBy: version.changedBy,
      changedAt: version.changedAt,
      changeDescription: version.changeDescription,
      contentSnapshot: version.contentSnapshot,
      contentDiff: version.contentDiff,
      previousVersionId: version.previousVersionId,
      nextVersionId: version.nextVersionId,
      tags: version.tags,
      metadata: version.metadata
    };
  }

  private mapRevisionToInterface(revision: ContentRevision): any {
    return {
      id: revision.id,
      blogPostId: revision.blogPostId,
      socialPostId: revision.socialPostId,
      snippetId: revision.snippetId,
      sectionId: revision.sectionId,
      paragraphIndex: revision.paragraphIndex,
      fromVersion: revision.fromVersion,
      toVersion: revision.toVersion,
      changeType: revision.changeType,
      changeSource: revision.changeSource,
      changedBy: revision.changedBy,
      changedAt: revision.changedAt,
      previousContent: revision.previousContent,
      newContent: revision.newContent,
      contentDiff: revision.contentDiff,
      changeNotes: revision.changeNotes,
      aiPrompt: revision.aiPrompt,
      aiModel: revision.aiModel
    };
  }
}