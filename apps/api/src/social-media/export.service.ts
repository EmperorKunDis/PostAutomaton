import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialMediaContentPlan } from '../database/entities/social-media-content-plan.entity';
import { SocialMediaPost } from '../database/entities/social-media-post.entity';

export interface ExportData {
  plan: {
    id: string;
    status: string;
    platforms: string[];
    writerProfiles: string[];
    publishingFrequency: string;
    totalPosts: number;
    createdAt: string;
  };
  blogPost: {
    title: string;
    excerpt: string;
    wordCount: number;
    estimatedReadTime: number;
  };
  posts: {
    id: string;
    platform: string;
    content: string;
    hashtags: string;
    callToAction: string;
    mediaType: string;
    angle: string;
    status: string;
    characterCount: number;
    writerProfile: string;
    visualConcepts: string;
    aiPrompts: string;
    videoScripts: string;
    suggestedCTAs: string;
  }[];
}

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(SocialMediaContentPlan)
    private contentPlanRepository: Repository<SocialMediaContentPlan>,
  ) {}

  async exportContentPlanData(planId: string, userId: string): Promise<ExportData> {
    const plan = await this.contentPlanRepository.findOne({
      where: { id: planId },
      relations: ['posts', 'posts.writerProfile', 'blogPost', 'company']
    });

    if (!plan) {
      throw new NotFoundException('Content plan not found');
    }

    // Verify user has access
    if (plan.userId !== userId) {
      throw new NotFoundException('Content plan not found');
    }

    return {
      plan: {
        id: plan.id,
        status: plan.status,
        platforms: plan.selectedPlatforms,
        writerProfiles: plan.selectedWriterProfiles,
        publishingFrequency: plan.publishingFrequency,
        totalPosts: plan.posts.length,
        createdAt: plan.createdAt.toISOString()
      },
      blogPost: {
        title: plan.blogPost.title,
        excerpt: plan.blogPost.excerpt,
        wordCount: plan.blogPost.wordCount,
        estimatedReadTime: plan.blogPost.estimatedReadTime
      },
      posts: plan.posts.map(post => ({
        id: post.id,
        platform: post.platform,
        content: post.content,
        hashtags: post.hashtags.join(' '),
        callToAction: post.callToAction || '',
        mediaType: post.mediaType,
        angle: post.angle,
        status: post.status,
        characterCount: post.characterCount,
        writerProfile: post.writerProfile?.name || 'Unknown',
        visualConcepts: this.formatVisualConcepts(post.visualConcepts),
        aiPrompts: this.extractAIPrompts(post.visualConcepts),
        videoScripts: this.extractVideoScripts(post.visualConcepts),
        suggestedCTAs: this.extractSuggestedCTAs(post.visualConcepts)
      }))
    };
  }

  generateCSV(data: ExportData): string {
    const headers = [
      'Post ID', 'Platform', 'Content', 'Hashtags', 'Call to Action',
      'Media Type', 'Angle', 'Status', 'Character Count', 'Writer Profile',
      'Visual Concepts', 'AI Prompts', 'Video Scripts', 'Suggested CTAs'
    ];

    const rows = data.posts.map(post => [
      post.id,
      post.platform,
      `"${post.content.replace(/"/g, '""')}"`,
      `"${post.hashtags}"`,
      `"${post.callToAction.replace(/"/g, '""')}"`,
      post.mediaType,
      post.angle,
      post.status,
      post.characterCount.toString(),
      `"${post.writerProfile}"`,
      `"${post.visualConcepts.replace(/"/g, '""')}"`,
      `"${post.aiPrompts.replace(/"/g, '""')}"`,
      `"${post.videoScripts.replace(/"/g, '""')}"`,
      `"${post.suggestedCTAs.replace(/"/g, '""')}"`
    ]);

    return [
      `# Content Plan Export - ${data.plan.id}`,
      `# Blog Post: ${data.blogPost.title}`,
      `# Total Posts: ${data.plan.totalPosts} across ${data.plan.platforms.length} platforms`,
      `# Generated: ${new Date().toISOString()}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  generateNotionFormat(data: ExportData): any {
    return {
      database_title: `Social Media Content Plan - ${data.blogPost.title}`,
      properties: {
        'Post ID': { type: 'title' },
        'Platform': { type: 'select' },
        'Content': { type: 'rich_text' },
        'Hashtags': { type: 'rich_text' },
        'Call to Action': { type: 'rich_text' },
        'Media Type': { type: 'select' },
        'Angle': { type: 'select' },
        'Status': { type: 'select' },
        'Character Count': { type: 'number' },
        'Writer Profile': { type: 'rich_text' },
        'AI Prompts': { type: 'rich_text' },
        'Video Scripts': { type: 'rich_text' },
        'Suggested CTAs': { type: 'rich_text' }
      },
      pages: data.posts.map(post => ({
        properties: {
          'Post ID': { title: [{ text: { content: post.id } }] },
          'Platform': { select: { name: post.platform } },
          'Content': { rich_text: [{ text: { content: post.content } }] },
          'Hashtags': { rich_text: [{ text: { content: post.hashtags } }] },
          'Call to Action': { rich_text: [{ text: { content: post.callToAction } }] },
          'Media Type': { select: { name: post.mediaType } },
          'Angle': { select: { name: post.angle } },
          'Status': { select: { name: post.status } },
          'Character Count': { number: post.characterCount },
          'Writer Profile': { rich_text: [{ text: { content: post.writerProfile } }] },
          'AI Prompts': { rich_text: [{ text: { content: post.aiPrompts } }] },
          'Video Scripts': { rich_text: [{ text: { content: post.videoScripts } }] },
          'Suggested CTAs': { rich_text: [{ text: { content: post.suggestedCTAs } }] }
        }
      }))
    };
  }

  generateBufferFormat(data: ExportData): any[] {
    return data.posts.map(post => ({
      text: post.content + '\n\n' + post.hashtags,
      profile_ids: [], // Would need to be configured based on user's Buffer setup
      scheduled_at: null, // Could be calculated based on publishing frequency
      media: {
        description: post.visualConcepts,
        photo: post.aiPrompts ? 'AI_GENERATED_PLACEHOLDER' : null
      },
      service_link: null
    }));
  }

  generateHootsuiteFormat(data: ExportData): any[] {
    return data.posts.map(post => ({
      text: post.content,
      hashtags: post.hashtags.split(' ').filter(tag => tag.startsWith('#')),
      callToAction: post.callToAction,
      socialNetworks: [post.platform],
      mediaType: post.mediaType,
      scheduledSendTime: null, // Would be calculated based on frequency
      metadata: {
        angle: post.angle,
        writerProfile: post.writerProfile,
        visualConcepts: post.visualConcepts,
        aiPrompts: post.aiPrompts
      }
    }));
  }

  private formatVisualConcepts(visualConcepts: any[]): string {
    if (!visualConcepts || visualConcepts.length === 0) return '';
    
    return visualConcepts.map(concept => 
      `${concept.type}: ${concept.description}`
    ).join('; ');
  }

  private extractAIPrompts(visualConcepts: any[]): string {
    if (!visualConcepts || visualConcepts.length === 0) return '';
    
    return visualConcepts
      .filter(concept => concept.aiPrompt)
      .map(concept => concept.aiPrompt)
      .join('; ');
  }

  private extractVideoScripts(visualConcepts: any[]): string {
    if (!visualConcepts || visualConcepts.length === 0) return '';
    
    return visualConcepts
      .filter(concept => concept.script)
      .map(concept => concept.script)
      .join('; ');
  }

  private extractSuggestedCTAs(visualConcepts: any[]): string {
    if (!visualConcepts || visualConcepts.length === 0) return '';
    
    const allCTAs = visualConcepts
      .filter(concept => concept.suggestedCTAs)
      .flatMap(concept => concept.suggestedCTAs);
    
    return [...new Set(allCTAs)].join('; ');
  }
}