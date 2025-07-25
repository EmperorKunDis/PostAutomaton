import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { ContentAsset } from '../database/entities/content-asset.entity';
import { ContentTag } from '../database/entities/content-tag.entity';
import { ReusableSnippet } from '../database/entities/reusable-snippet.entity';
import { MediaAsset } from '../database/entities/media-asset.entity';
import { AssetUsage } from '../database/entities/asset-usage.entity';
import { BlogPost } from '../database/entities/blog-post.entity';
import { SocialMediaPost } from '../database/entities/social-media-post.entity';
import {
  ContentLibrarySearchRequest,
  ContentLibrarySearchResponse,
  CreateContentTagRequest,
  UpdateContentAssetRequest,
  CreateReusableSnippetRequest,
  UpdateReusableSnippetRequest,
  ContentAssetType,
  ContentStatus
} from '@internal-marketing-content-app/shared';

@Injectable()
export class ContentLibraryService {
  constructor(
    @InjectRepository(ContentAsset)
    private contentAssetRepository: Repository<ContentAsset>,
    @InjectRepository(ContentTag)
    private contentTagRepository: Repository<ContentTag>,
    @InjectRepository(ReusableSnippet)
    private reusableSnippetRepository: Repository<ReusableSnippet>,
    @InjectRepository(MediaAsset)
    private mediaAssetRepository: Repository<MediaAsset>,
    @InjectRepository(AssetUsage)
    private assetUsageRepository: Repository<AssetUsage>,
    @InjectRepository(BlogPost)
    private blogPostRepository: Repository<BlogPost>,
    @InjectRepository(SocialMediaPost)
    private socialMediaPostRepository: Repository<SocialMediaPost>,
  ) {}

  async searchContentLibrary(
    searchRequest: ContentLibrarySearchRequest,
    userId: string
  ): Promise<ContentLibrarySearchResponse> {
    const { filters, sort, pagination } = searchRequest;
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    // Build base queries
    const assetQuery = this.buildAssetQuery(filters, userId);
    const snippetQuery = this.buildSnippetQuery(filters, userId);
    const mediaQuery = this.buildMediaQuery(filters, userId);

    // Apply sorting
    if (sort) {
      const sortField = this.mapSortField(sort.field);
      assetQuery.orderBy(sortField, sort.direction.toUpperCase() as 'ASC' | 'DESC');
      snippetQuery.orderBy(sortField, sort.direction.toUpperCase() as 'ASC' | 'DESC');
      mediaQuery.orderBy(sortField, sort.direction.toUpperCase() as 'ASC' | 'DESC');
    } else {
      assetQuery.orderBy('asset.updatedAt', 'DESC');
      snippetQuery.orderBy('snippet.updatedAt', 'DESC');
      mediaQuery.orderBy('media.updatedAt', 'DESC');
    }

    // Execute queries
    const [assets, assetsCount] = await assetQuery
      .limit(limit)
      .offset(offset)
      .getManyAndCount();

    const [snippets, snippetsCount] = await snippetQuery
      .limit(limit)
      .offset(offset)
      .getManyAndCount();

    const [mediaAssets, mediaCount] = await mediaQuery
      .limit(limit)
      .offset(offset)
      .getManyAndCount();

    // Get available tags for filtering
    const tags = await this.contentTagRepository.find({
      where: { companyId: filters.companyId },
      order: { name: 'ASC' }
    });

    const totalCount = assetsCount + snippetsCount + mediaCount;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      assets: assets.map(asset => this.mapContentAssetToInterface(asset)),
      snippets: snippets.map(snippet => this.mapReusableSnippetToInterface(snippet)),
      mediaAssets: mediaAssets.map(media => this.mapMediaAssetToInterface(media)),
      totalCount,
      totalPages,
      currentPage: page,
      tags: tags.map(tag => this.mapContentTagToInterface(tag))
    };
  }

  private buildAssetQuery(filters: any, userId: string): SelectQueryBuilder<ContentAsset> {
    const query = this.contentAssetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.user', 'user')
      .leftJoinAndSelect('asset.company', 'company')
      .leftJoinAndSelect('asset.usageHistory', 'usage');

    if (filters.companyId) {
      query.andWhere('asset.companyId = :companyId', { companyId: filters.companyId });
    }

    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      query.andWhere('asset.type IN (:...types)', { types });
    }

    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      query.andWhere('asset.status IN (:...statuses)', { statuses });
    }

    if (filters.tags && filters.tags.length > 0) {
      // JSON search for tags array
      const tagConditions = filters.tags.map((_, index) => 
        `JSON_CONTAINS(asset.tags, :tag${index})`
      ).join(' OR ');
      
      query.andWhere(`(${tagConditions})`);
      
      filters.tags.forEach((tag: string, index: number) => {
        query.setParameter(`tag${index}`, JSON.stringify(tag));
      });
    }

    if (filters.category) {
      query.andWhere('asset.category = :category', { category: filters.category });
    }

    if (filters.search) {
      query.andWhere(
        '(asset.title LIKE :search OR asset.description LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.dateRange) {
      query.andWhere('asset.createdAt BETWEEN :from AND :to', {
        from: filters.dateRange.from,
        to: filters.dateRange.to
      });
    }

    return query;
  }

  private buildSnippetQuery(filters: any, userId: string): SelectQueryBuilder<ReusableSnippet> {
    const query = this.reusableSnippetRepository
      .createQueryBuilder('snippet')
      .leftJoinAndSelect('snippet.user', 'user')
      .leftJoinAndSelect('snippet.company', 'company');

    if (filters.companyId) {
      query.andWhere('snippet.companyId = :companyId', { companyId: filters.companyId });
    }

    // Only include snippet types in search
    if (!filters.type || (Array.isArray(filters.type) && filters.type.includes('reusable_snippet'))) {
      // Continue with snippet query
    } else {
      // Return empty query if not searching for snippets
      query.andWhere('1 = 0');
    }

    if (filters.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map((_, index) => 
        `JSON_CONTAINS(snippet.tags, :tag${index})`
      ).join(' OR ');
      
      query.andWhere(`(${tagConditions})`);
      
      filters.tags.forEach((tag: string, index: number) => {
        query.setParameter(`tag${index}`, JSON.stringify(tag));
      });
    }

    if (filters.search) {
      query.andWhere(
        '(snippet.title LIKE :search OR snippet.content LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.dateRange) {
      query.andWhere('snippet.createdAt BETWEEN :from AND :to', {
        from: filters.dateRange.from,
        to: filters.dateRange.to
      });
    }

    return query;
  }

  private buildMediaQuery(filters: any, userId: string): SelectQueryBuilder<MediaAsset> {
    const query = this.mediaAssetRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.user', 'user')
      .leftJoinAndSelect('media.company', 'company')
      .leftJoinAndSelect('media.usageHistory', 'usage');

    if (filters.companyId) {
      query.andWhere('media.companyId = :companyId', { companyId: filters.companyId });
    }

    // Only include media types in search
    if (!filters.type || (Array.isArray(filters.type) && 
        (filters.type.includes('media_asset') || filters.type.includes('visual_asset')))) {
      // Continue with media query
    } else {
      // Return empty query if not searching for media
      query.andWhere('1 = 0');
    }

    if (filters.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map((_, index) => 
        `JSON_CONTAINS(media.tags, :tag${index})`
      ).join(' OR ');
      
      query.andWhere(`(${tagConditions})`);
      
      filters.tags.forEach((tag: string, index: number) => {
        query.setParameter(`tag${index}`, JSON.stringify(tag));
      });
    }

    if (filters.category) {
      query.andWhere('media.category = :category', { category: filters.category });
    }

    if (filters.search) {
      query.andWhere(
        '(media.title LIKE :search OR media.description LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.dateRange) {
      query.andWhere('media.uploadedAt BETWEEN :from AND :to', {
        from: filters.dateRange.from,
        to: filters.dateRange.to
      });
    }

    return query;
  }

  private mapSortField(field: string): string {
    const mapping = {
      'createdAt': 'asset.createdAt',
      'updatedAt': 'asset.updatedAt',
      'title': 'asset.title',
      'timesUsed': 'asset.timesUsed',
      'lastUsed': 'asset.lastUsed'
    };
    return mapping[field] || 'asset.updatedAt';
  }

  async createContentTag(
    request: CreateContentTagRequest,
    companyId: string,
    userId: string
  ): Promise<any> {
    // Check if tag already exists
    const existingTag = await this.contentTagRepository.findOne({
      where: { name: request.name.toLowerCase(), companyId }
    });

    if (existingTag) {
      throw new BadRequestException('Tag with this name already exists');
    }

    const tag = this.contentTagRepository.create({
      name: request.name.toLowerCase(),
      type: request.type,
      color: request.color,
      description: request.description,
      companyId,
      userId
    });

    const savedTag = await this.contentTagRepository.save(tag);
    return this.mapContentTagToInterface(savedTag);
  }

  async updateContentAsset(
    request: UpdateContentAssetRequest,
    userId: string
  ): Promise<any> {
    const asset = await this.contentAssetRepository.findOne({
      where: { id: request.id }
    });

    if (!asset) {
      throw new NotFoundException('Content asset not found');
    }

    // Update fields
    if (request.title !== undefined) asset.title = request.title;
    if (request.description !== undefined) asset.description = request.description;
    if (request.tags !== undefined) asset.tags = request.tags;
    if (request.category !== undefined) asset.category = request.category;
    if (request.status !== undefined) asset.status = request.status;

    const updatedAsset = await this.contentAssetRepository.save(asset);
    return this.mapContentAssetToInterface(updatedAsset);
  }

  async createReusableSnippet(
    request: CreateReusableSnippetRequest,
    companyId: string,
    userId: string
  ): Promise<any> {
    const snippet = this.reusableSnippetRepository.create({
      title: request.title,
      content: request.content,
      type: request.type,
      tags: request.tags || [],
      companyId,
      userId
    });

    const savedSnippet = await this.reusableSnippetRepository.save(snippet);
    return this.mapReusableSnippetToInterface(savedSnippet);
  }

  async updateReusableSnippet(
    request: UpdateReusableSnippetRequest,
    userId: string
  ): Promise<any> {
    const snippet = await this.reusableSnippetRepository.findOne({
      where: { id: request.id }
    });

    if (!snippet) {
      throw new NotFoundException('Reusable snippet not found');
    }

    // Update fields
    if (request.title !== undefined) snippet.title = request.title;
    if (request.content !== undefined) snippet.content = request.content;
    if (request.type !== undefined) snippet.type = request.type;
    if (request.tags !== undefined) snippet.tags = request.tags;

    const updatedSnippet = await this.reusableSnippetRepository.save(snippet);
    return this.mapReusableSnippetToInterface(updatedSnippet);
  }

  async trackAssetUsage(
    assetId: string,
    usedInType: 'blog_post' | 'social_post' | 'campaign',
    usedInId: string,
    userId: string,
    platform?: string
  ): Promise<void> {
    // Create usage record
    const usage = this.assetUsageRepository.create({
      assetId,
      usedInType,
      usedInId,
      usedBy: userId,
      platform
    });

    await this.assetUsageRepository.save(usage);

    // Update asset usage count
    await this.contentAssetRepository.increment(
      { id: assetId },
      'timesUsed',
      1
    );

    await this.contentAssetRepository.update(
      { id: assetId },
      { lastUsed: new Date() }
    );
  }

  // Auto-create content assets for existing blog posts and social posts
  async syncExistingContent(companyId: string, userId: string): Promise<void> {
    // Sync blog posts
    const blogPosts = await this.blogPostRepository.find({
      where: { companyId }
    });

    for (const blogPost of blogPosts) {
      const existingAsset = await this.contentAssetRepository.findOne({
        where: { blogPostId: blogPost.id }
      });

      if (!existingAsset) {
        const asset = this.contentAssetRepository.create({
          title: blogPost.title,
          description: blogPost.excerpt,
          type: 'blog_post' as ContentAssetType,
          status: this.mapBlogPostStatus(blogPost.status),
          blogPostId: blogPost.id,
          tags: [], // Could extract from contentTopic.category
          companyId,
          userId: blogPost.userId,
          createdAt: blogPost.createdAt,
          updatedAt: blogPost.updatedAt
        });

        await this.contentAssetRepository.save(asset);
      }
    }

    // Sync social media posts
    const socialPosts = await this.socialMediaPostRepository.find({
      relations: ['contentPlan'],
      where: { contentPlan: { companyId } }
    });

    for (const socialPost of socialPosts) {
      const existingAsset = await this.contentAssetRepository.findOne({
        where: { socialPostId: socialPost.id }
      });

      if (!existingAsset) {
        const asset = this.contentAssetRepository.create({
          title: `${socialPost.platform} Post - ${socialPost.content.substring(0, 50)}...`,
          description: socialPost.content,
          type: 'social_post' as ContentAssetType,
          status: this.mapSocialPostStatus(socialPost.status),
          socialPostId: socialPost.id,
          tags: [], // Could extract from hashtags
          companyId,
          userId: socialPost.writerProfileId, // Approximate
          createdAt: socialPost.createdAt,
          updatedAt: socialPost.updatedAt
        });

        await this.contentAssetRepository.save(asset);
      }
    }
  }

  private mapBlogPostStatus(status: string): ContentStatus {
    const mapping = {
      'draft': 'draft' as ContentStatus,
      'outline_review': 'in_review' as ContentStatus,
      'content_review': 'in_review' as ContentStatus,
      'approved': 'approved' as ContentStatus,
      'published': 'published' as ContentStatus
    };
    return mapping[status] || 'draft' as ContentStatus;
  }

  private mapSocialPostStatus(status: string): ContentStatus {
    const mapping = {
      'draft': 'draft' as ContentStatus,
      'approved': 'approved' as ContentStatus,
      'scheduled': 'approved' as ContentStatus,
      'published': 'published' as ContentStatus
    };
    return mapping[status] || 'draft' as ContentStatus;
  }

  private mapContentAssetToInterface(asset: ContentAsset): any {
    return {
      id: asset.id,
      title: asset.title,
      description: asset.description,
      type: asset.type,
      status: asset.status,
      blogPostId: asset.blogPostId,
      socialPostId: asset.socialPostId,
      contentSnippetId: asset.contentSnippetId,
      mediaAssetId: asset.mediaAssetId,
      tags: asset.tags,
      category: asset.category,
      companyId: asset.companyId,
      userId: asset.userId,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      timesUsed: asset.timesUsed,
      lastUsed: asset.lastUsed,
      fileName: asset.fileName,
      fileSize: asset.fileSize,
      mimeType: asset.mimeType,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl,
      usageHistory: asset.usageHistory?.map(usage => ({
        id: usage.id,
        assetId: usage.assetId,
        usedInType: usage.usedInType,
        usedInId: usage.usedInId,
        usedAt: usage.usedAt,
        usedBy: usage.usedBy,
        platform: usage.platform
      })) || []
    };
  }

  private mapReusableSnippetToInterface(snippet: ReusableSnippet): any {
    return {
      id: snippet.id,
      title: snippet.title,
      content: snippet.content,
      type: snippet.type,
      tags: snippet.tags,
      companyId: snippet.companyId,
      userId: snippet.userId,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
      timesUsed: snippet.timesUsed,
      lastUsed: snippet.lastUsed
    };
  }

  private mapMediaAssetToInterface(media: MediaAsset): any {
    return {
      id: media.id,
      title: media.title,
      description: media.description,
      fileName: media.fileName,
      originalFileName: media.originalFileName,
      fileSize: media.fileSize,
      mimeType: media.mimeType,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl,
      width: media.width,
      height: media.height,
      duration: media.duration,
      tags: media.tags,
      category: media.category,
      companyId: media.companyId,
      userId: media.userId,
      uploadedAt: media.uploadedAt,
      updatedAt: media.updatedAt,
      timesUsed: media.timesUsed,
      lastUsed: media.lastUsed,
      usageHistory: media.usageHistory?.map(usage => ({
        id: usage.id,
        assetId: usage.assetId,
        usedInType: usage.usedInType,
        usedInId: usage.usedInId,
        usedAt: usage.usedAt,
        usedBy: usage.usedBy,
        platform: usage.platform
      })) || []
    };
  }

  private mapContentTagToInterface(tag: ContentTag): any {
    return {
      id: tag.id,
      name: tag.name,
      type: tag.type,
      color: tag.color,
      description: tag.description,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt
    };
  }
}