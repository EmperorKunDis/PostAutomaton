import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialMediaPost } from '../database/entities/social-media-post.entity';
import { SocialMediaContentPlan } from '../database/entities/social-media-content-plan.entity';
import { BlogPost } from '../database/entities/blog-post.entity';
import { WriterProfile } from '../database/entities/writer-profile.entity';
import { Company } from '../database/entities/company.entity';
import {
  GenerateSocialPostsRequest,
  GenerateSocialPostsResponse,
  SocialMediaPost as ISocialMediaPost,
  SocialMediaContentPlan as ISocialMediaContentPlan,
  UpdateSocialPostRequest,
  RegenerateSocialPostRequest,
  SocialMediaPlatform,
  VisualConcept,
  PLATFORM_CONSTRAINTS
} from '@internal-marketing-content-app/shared';

@Injectable()
export class SocialMediaService {
  constructor(
    @InjectRepository(SocialMediaPost)
    private readonly socialPostRepository: Repository<SocialMediaPost>,
    @InjectRepository(SocialMediaContentPlan)
    private readonly contentPlanRepository: Repository<SocialMediaContentPlan>,
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
    @InjectRepository(WriterProfile)
    private readonly writerProfileRepository: Repository<WriterProfile>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>
  ) {}

  async generateSocialPosts(
    request: GenerateSocialPostsRequest,
    userId: string
  ): Promise<GenerateSocialPostsResponse> {
    // Get the blog post with all relations
    const blogPost = await this.blogPostRepository.findOne({
      where: { id: request.blogPostId },
      relations: ['sections', 'contentTopic', 'company', 'user']
    });

    if (!blogPost) {
      throw new NotFoundException('Blog post not found');
    }

    if (blogPost.status !== 'approved' && blogPost.status !== 'published') {
      throw new BadRequestException('Blog post must be approved before generating social posts');
    }

    // Get writer profiles if specified, otherwise use the blog post's writer profile
    let writerProfiles: WriterProfile[] = [];
    if (request.writerProfileIds && request.writerProfileIds.length > 0) {
      writerProfiles = await this.writerProfileRepository.findByIds(request.writerProfileIds);
    } else if (blogPost.writerProfileId) {
      const profile = await this.writerProfileRepository.findOne({
        where: { id: blogPost.writerProfileId }
      });
      if (profile) writerProfiles = [profile];
    }

    if (writerProfiles.length === 0) {
      throw new BadRequestException('At least one writer profile is required');
    }

    // Extract insights from the blog post
    const insights = this.extractInsightsFromBlogPost(blogPost);

    // Create content plan
    const contentPlan = this.contentPlanRepository.create({
      blogPostId: blogPost.id,
      companyId: blogPost.companyId,
      userId,
      selectedPlatforms: request.platforms,
      selectedWriterProfiles: writerProfiles.map(p => p.id),
      publishingFrequency: 'weekly',
      status: 'draft',
      posts: []
    });

    await this.contentPlanRepository.save(contentPlan);

    // Generate posts for each platform and writer profile combination
    const posts: SocialMediaPost[] = [];
    const postsPerPlatform = request.postsPerPlatform || 3;

    for (const platform of request.platforms) {
      for (const writerProfile of writerProfiles) {
        const platformPosts = await this.generatePostsForPlatform(
          blogPost,
          platform,
          writerProfile,
          contentPlan,
          insights,
          postsPerPlatform,
          request.includeVisuals || false
        );
        posts.push(...platformPosts);
      }
    }

    // Save all posts
    await this.socialPostRepository.save(posts);

    // Update content plan with posts
    contentPlan.posts = posts;
    await this.contentPlanRepository.save(contentPlan);

    return {
      contentPlan: this.mapContentPlanToInterface(contentPlan),
      posts: posts.map(p => this.mapPostToInterface(p)),
      insights
    };
  }

  private extractInsightsFromBlogPost(blogPost: BlogPost): {
    keyTakeaways: string[];
    quotableSegments: string[];
    angleVariations: string[];
  } {
    const keyTakeaways: string[] = [];
    const quotableSegments: string[] = [];
    const angleVariations: string[] = [];

    // Extract key takeaways from sections
    blogPost.sections.forEach(section => {
      // Look for sections with specific purposes
      if (section.purpose.toLowerCase().includes('takeaway') || 
          section.purpose.toLowerCase().includes('conclusion')) {
        keyTakeaways.push(this.extractFirstSentence(section.content));
      }

      // Extract quotable segments (sentences with strong statements)
      const sentences = section.content.split(/[.!?]+/);
      sentences.forEach(sentence => {
        if (sentence.length > 50 && sentence.length < 200) {
          if (sentence.includes('essential') || sentence.includes('critical') || 
              sentence.includes('important') || sentence.includes('must')) {
            quotableSegments.push(sentence.trim());
          }
        }
      });
    });

    // Generate angle variations based on content
    const topicTitle = blogPost.contentTopic?.title || blogPost.title;
    angleVariations.push(
      `Technical deep-dive into ${topicTitle}`,
      `The emotional impact of ${topicTitle}`,
      `Breaking news: Latest developments in ${topicTitle}`,
      `Learn how ${topicTitle} can transform your business`,
      `Why ${topicTitle} matters more than ever`
    );

    return {
      keyTakeaways: keyTakeaways.slice(0, 5),
      quotableSegments: quotableSegments.slice(0, 5),
      angleVariations
    };
  }

  private async generatePostsForPlatform(
    blogPost: BlogPost,
    platform: SocialMediaPlatform,
    writerProfile: WriterProfile,
    contentPlan: SocialMediaContentPlan,
    insights: any,
    count: number,
    includeVisuals: boolean
  ): Promise<SocialMediaPost[]> {
    const posts: SocialMediaPost[] = [];
    const angles: Array<'technical' | 'emotional' | 'news' | 'educational' | 'inspirational'> = 
      ['technical', 'emotional', 'educational'];

    for (let i = 0; i < Math.min(count, angles.length); i++) {
      const angle = angles[i];
      const content = this.generatePostContent(
        blogPost,
        platform,
        writerProfile,
        angle,
        insights,
        i
      );

      const hashtags = this.generateHashtags(blogPost, platform);
      const emojis = this.generateEmojis(platform, angle);
      const visualConcepts = includeVisuals ? this.generateVisualConcepts(platform, blogPost, angle) : undefined;

      const post = this.socialPostRepository.create({
        blogPostId: blogPost.id,
        contentPlanId: contentPlan.id,
        platform,
        writerProfileId: writerProfile.id,
        content,
        hashtags,
        emojis,
        callToAction: this.generateCTA(platform, angle),
        characterCount: content.length,
        mediaType: this.determineMediaType(platform, includeVisuals),
        visualConcepts,
        angle,
        status: 'draft'
      });

      posts.push(post);
    }

    return posts;
  }

  private generatePostContent(
    blogPost: BlogPost,
    platform: SocialMediaPlatform,
    writerProfile: WriterProfile,
    angle: 'technical' | 'emotional' | 'news' | 'educational' | 'inspirational',
    insights: any,
    index: number
  ): string {
    const maxChars = PLATFORM_CONSTRAINTS[platform].maxChars;
    let content = '';

    // Start with an attention-grabbing opener based on angle
    const openers = {
      technical: `🔬 Deep dive: ${blogPost.title}`,
      emotional: `💡 This changed everything for us...`,
      news: `📢 Breaking: New insights on ${blogPost.contentTopic?.title || blogPost.title}`,
      educational: `📚 Learn something new today:`,
      inspirational: `✨ Your next breakthrough starts here:`
    };

    content = openers[angle] + '\n\n';

    // Add main content based on available insights
    if (insights.keyTakeaways[index]) {
      content += insights.keyTakeaways[index] + '\n\n';
    } else if (insights.quotableSegments[index]) {
      content += `"${insights.quotableSegments[index]}"\n\n`;
    } else {
      content += this.extractFirstSentence(blogPost.excerpt) + '\n\n';
    }

    // Add writer's perspective
    if (writerProfile.tone === 'Professional') {
      content += `As ${writerProfile.position}, I've seen firsthand how this impacts our industry.\n\n`;
    } else if (writerProfile.tone === 'Casual') {
      content += `Here's what we learned (spoiler: it's game-changing!):\n\n`;
    }

    // Trim to platform limits
    if (content.length > maxChars - 50) { // Leave room for hashtags
      content = content.substring(0, maxChars - 50) + '...';
    }

    return content.trim();
  }

  private generateHashtags(blogPost: BlogPost, platform: SocialMediaPlatform): string[] {
    const hashtags: string[] = [];
    
    // Add topic-based hashtags
    const topicTitle = blogPost.contentTopic?.title || blogPost.title;
    const topicWords = topicTitle.split(' ')
      .filter(word => word.length > 3)
      .map(word => '#' + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    
    hashtags.push(...topicWords.slice(0, 2));

    // Add category-based hashtag  
    if (blogPost.contentTopic && blogPost.contentTopic.category && blogPost.contentTopic.category.name) {
      hashtags.push('#' + blogPost.contentTopic.category.name.replace(/\s+/g, ''));
    }

    // Add platform-specific trending hashtags
    const platformHashtags = {
      linkedin: ['#BusinessGrowth', '#Innovation', '#Leadership'],
      twitter: ['#TechTwitter', '#StartupLife', '#Innovation'],
      instagram: ['#BusinessTips', '#EntrepreneurLife', '#SuccessMindset'],
      facebook: ['#SmallBusiness', '#BusinessOwner', '#GrowYourBusiness'],
      tiktok: ['#BusinessTok', '#CareerAdvice', '#LearnOnTikTok'],
      youtube: ['#Shorts', '#BusinessTips', '#HowTo'],
      pinterest: ['#BusinessIdeas', '#MarketingTips', '#Success'],
      threads: ['#ThreadsForBusiness', '#BusinessCommunity'],
      reddit: [] // Reddit doesn't use hashtags
    };

    hashtags.push(...(platformHashtags[platform] || []).slice(0, 2));

    return hashtags.slice(0, 5); // Limit to 5 hashtags
  }

  private generateEmojis(platform: SocialMediaPlatform, angle: string): string[] {
    const angleEmojis = {
      technical: ['🔬', '💻', '🔧', '📊', '🎯'],
      emotional: ['💡', '❤️', '🌟', '✨', '🙌'],
      news: ['📢', '🔥', '🚀', '📰', '⚡'],
      educational: ['📚', '🎓', '💭', '🧠', '📝'],
      inspirational: ['✨', '🌈', '💪', '🎯', '🚀']
    };

    return angleEmojis[angle] || ['👍', '💼', '📈'];
  }

  private generateCTA(platform: SocialMediaPlatform, angle: string): string {
    const ctas = {
      linkedin: {
        technical: 'What technical challenges are you facing? Let\'s discuss in the comments.',
        emotional: 'Share your story below. We\'d love to hear your experience.',
        news: 'Follow us for more industry updates and insights.',
        educational: 'Save this post for future reference. What would you add?',
        inspirational: 'Tag someone who needs to see this today.'
      },
      twitter: {
        technical: 'RT if you found this helpful! 🔄',
        emotional: 'Quote tweet with your thoughts 💭',
        news: 'Follow for more updates 🔔',
        educational: 'Bookmark this thread 🔖',
        inspirational: 'Who else needs to see this? Tag them! 👇'
      },
      instagram: {
        technical: 'Double tap if you learned something new! Which tip was most helpful?',
        emotional: 'Save this for when you need it most ❤️',
        news: 'Share to your stories to spread the word!',
        educational: 'Which tip will you try first? Comment below!',
        inspirational: 'Tag a friend who needs this reminder today 🌟'
      }
    };

    return ctas[platform]?.[angle] || 'Learn more on our blog (link in bio)';
  }

  private generateVisualConcepts(
    platform: SocialMediaPlatform,
    blogPost: BlogPost,
    angle: string
  ): VisualConcept[] {
    const concepts: VisualConcept[] = [];
    const timestamp = Date.now();

    // 4.1: Carousel Content for Instagram and Pinterest
    if (platform === 'instagram' || platform === 'pinterest') {
      // Carousel concept
      concepts.push({
        id: `vc-${timestamp}-1`,
        type: 'carousel',
        description: `"Top 5 Insights from ${blogPost.title.substring(0, 30)}..." - Multi-slide carousel breaking down key takeaways`,
        aiPrompt: `Professional ${blogPost.company.industry} carousel design, clean layout, slide 1: title card with "${blogPost.title}", slides 2-6: key insights with icons, ${angle} aesthetic, branded colors`
      });

      // 4.2: AI Image Prompts
      const imagePrompts = this.generateAIImagePrompts(blogPost, angle);
      concepts.push({
        id: `vc-${timestamp}-2`,
        type: 'image',
        description: `Hero image concept: ${imagePrompts.heroDescription}`,
        aiPrompt: imagePrompts.heroPrompt
      });

      // 4.3: Visual Element Mockups - Quote Card
      concepts.push({
        id: `vc-${timestamp}-3`,
        type: 'quote_card',
        description: 'Branded quote card featuring key insight from the blog post',
        aiPrompt: `Minimalist quote card design, ${blogPost.company.industry} branding, professional typography, subtle background pattern, company logo placement`
      });

      // 4.3: Visual Element Mockups - Chart/Infographic
      if (this.shouldIncludeChart(blogPost)) {
        concepts.push({
          id: `vc-${timestamp}-4`,
          type: 'infographic',
          description: 'Data visualization or process chart based on blog content',
          aiPrompt: `Clean infographic design, ${angle} style, data visualization for ${blogPost.company.industry}, modern chart design with brand colors`
        });
      }
    }

    // 4.4: Video Script Snippets & 4.5: Visual Scene Ideas for TikTok and YouTube Shorts
    if (platform === 'tiktok' || platform === 'youtube') {
      const videoScripts = this.generateVideoScripts(blogPost, angle);
      
      // 15-second quick tip video
      concepts.push({
        id: `vc-${timestamp}-5`,
        type: 'video',
        description: '15-second quick tip derived from blog takeaways',
        sceneIdeas: [
          `Hook: "${videoScripts.hook}" (2-3s)`,
          `Main insight with text overlay (8-10s)`,
          `Quick example or demonstration (3-4s)`,
          `CTA: "Full article in bio" (1-2s)`
        ],
        duration: 15,
        script: videoScripts.quickTip
      });

      // 30-second detailed explainer
      concepts.push({
        id: `vc-${timestamp}-6`,
        type: 'video',
        description: '30-second explainer video with workspace B-roll',
        sceneIdeas: [
          `Opening hook with surprising statistic (3-5s)`,
          `Problem setup with voiceover + B-roll from workspace (8-10s)`,
          `Solution explanation with text overlays (12-15s)`,
          `Call to action with blog preview (3-5s)`
        ],
        duration: 30,
        script: videoScripts.detailed
      });
    }

    // 4.6: Visual Content CTAs - Add platform-specific CTAs to all concepts
    concepts.forEach(concept => {
      concept.suggestedCTAs = this.generateVisualCTAs(platform, concept.type);
    });

    return concepts;
  }

  private generateAIImagePrompts(
    blogPost: BlogPost,
    angle: string
  ): { heroDescription: string; heroPrompt: string } {
    const industryThemes = {
      'Technology': 'modern tech workspace, sleek devices, digital elements',
      'Healthcare': 'clean medical environment, health symbols, caring atmosphere',
      'Finance': 'professional office, financial charts, business setting',
      'Education': 'learning environment, books, collaborative space',
      'Retail': 'product display, customer interaction, shopping experience',
      'Manufacturing': 'industrial setting, production line, quality focus'
    };

    const angleThemes = {
      'technical': 'detailed, analytical, data-focused',
      'emotional': 'human-centered, warm lighting, personal connection',
      'news': 'dynamic, urgent, newsworthy presentation',
      'educational': 'clear, instructional, step-by-step visual',
      'inspirational': 'aspirational, bright, motivational energy'
    };

    const industryTheme = industryThemes[blogPost.company.industry] || 'professional business environment';
    const angleTheme = angleThemes[angle] || 'professional';

    return {
      heroDescription: `${industryTheme} with ${angleTheme} composition`,
      heroPrompt: `High-quality ${industryTheme}, ${angleTheme}, professional photography, ${blogPost.company.industry} industry, clean composition, brand-appropriate lighting`
    };
  }

  private generateVideoScripts(
    blogPost: BlogPost,
    angle: string
  ): { hook: string; quickTip: string; detailed: string } {
    const hooks = {
      'technical': `Did you know ${blogPost.company.industry} companies that do this see 40% better results?`,
      'emotional': 'This one mistake cost us everything...',
      'news': `BREAKING: Major shift happening in ${blogPost.company.industry}`,
      'educational': `Learn this ${blogPost.company.industry} secret in 30 seconds`,
      'inspirational': 'What if I told you this could change your business forever?'
    };

    const hook = hooks[angle] || `Here's what you need to know about ${blogPost.title}`;

    return {
      hook,
      quickTip: `${hook}\n\nHere's the key insight from our latest research:\n[Main takeaway from blog]\n\nTry this approach and see the difference.\n\nRead the full breakdown in our latest article!`,
      detailed: `${hook}\n\n[Problem context - 8 seconds]\nMost companies struggle with this exact issue.\n\n[Solution explanation - 15 seconds] \nHere's the proven approach that works:\n[Key solution from blog post]\n\n[Call to action - 5 seconds]\nWant the complete strategy? Check out our full article linked in bio.`
    };
  }

  private generateVisualCTAs(
    platform: SocialMediaPlatform,
    conceptType: string
  ): string[] {
    const baseCTAs = [
      'Read the full story on our blog',
      'Follow us for more tips like this',
      'Share if this helped you',
      'Save this for later'
    ];

    const platformSpecific = {
      'instagram': ['Story highlights link in bio', 'Swipe for more insights', 'Double tap if you agree'],
      'pinterest': ['Pin this for later', 'Click through for full article', 'Save to your board'],
      'tiktok': ['Duet with your experience', 'Follow for more industry tips', 'Link in bio for details'],
      'youtube': ['Watch now', 'Subscribe for weekly insights', 'Comment your thoughts below'],
      'linkedin': ['Connect with me for more insights', 'Share with your network'],
      'twitter': ['Thread continues below', 'Retweet to share', 'Reply with your thoughts'],
      'facebook': ['Read more', 'Share with friends', 'React if this resonates']
    };

    const videoSpecific = conceptType === 'video' ? 
      ['Watch now', 'Turn on notifications', 'Like and subscribe'] : [];

    return [
      ...baseCTAs,
      ...(platformSpecific[platform] || []),
      ...videoSpecific
    ].slice(0, 4); // Limit to 4 CTAs
  }

  private shouldIncludeChart(blogPost: BlogPost): boolean {
    // Simple heuristic: include charts for technical/educational content
    const chartKeywords = ['data', 'statistics', 'process', 'steps', 'comparison', 'results', 'analysis'];
    const content = `${blogPost.title} ${blogPost.excerpt}`.toLowerCase();
    return chartKeywords.some(keyword => content.includes(keyword));
  }

  private determineMediaType(
    platform: SocialMediaPlatform,
    includeVisuals: boolean
  ): 'text' | 'image' | 'video' | 'carousel' {
    if (!includeVisuals) return 'text';

    const constraints = PLATFORM_CONSTRAINTS[platform];
    if (constraints.requiresVideo) return 'video';
    if (constraints.requiresImage || constraints.requiresMedia) return 'image';
    
    // Default media types for platforms
    if (platform === 'instagram' || platform === 'pinterest') return 'carousel';
    if (platform === 'tiktok' || platform === 'youtube') return 'video';
    
    return 'text';
  }

  private extractFirstSentence(text: string): string {
    const match = text.match(/^[^.!?]+[.!?]/);
    return match ? match[0].trim() : text.substring(0, 100) + '...';
  }

  async getContentPlans(companyId?: string): Promise<ISocialMediaContentPlan[]> {
    const query = this.contentPlanRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.posts', 'posts')
      .leftJoinAndSelect('plan.blogPost', 'blogPost')
      .leftJoinAndSelect('plan.company', 'company')
      .orderBy('plan.createdAt', 'DESC');

    if (companyId) {
      query.where('plan.companyId = :companyId', { companyId });
    }

    const plans = await query.getMany();
    return plans.map(plan => this.mapContentPlanToInterface(plan));
  }

  async getContentPlan(id: string): Promise<ISocialMediaContentPlan> {
    const plan = await this.contentPlanRepository.findOne({
      where: { id },
      relations: ['posts', 'blogPost', 'company']
    });

    if (!plan) {
      throw new NotFoundException('Content plan not found');
    }

    return this.mapContentPlanToInterface(plan);
  }

  async updateSocialPost(
    postId: string,
    updateRequest: UpdateSocialPostRequest,
    userId: string
  ): Promise<ISocialMediaPost> {
    const post = await this.socialPostRepository.findOne({
      where: { id: postId },
      relations: ['contentPlan']
    });

    if (!post) {
      throw new NotFoundException('Social media post not found');
    }

    // Verify user has access
    if (post.contentPlan.userId !== userId) {
      throw new BadRequestException('Unauthorized to update this post');
    }

    // Update fields
    if (updateRequest.content !== undefined) {
      post.content = updateRequest.content;
      post.characterCount = updateRequest.content.length;
    }
    if (updateRequest.hashtags !== undefined) post.hashtags = updateRequest.hashtags;
    if (updateRequest.emojis !== undefined) post.emojis = updateRequest.emojis;
    if (updateRequest.callToAction !== undefined) post.callToAction = updateRequest.callToAction;
    if (updateRequest.visualConcepts !== undefined) post.visualConcepts = updateRequest.visualConcepts;
    if (updateRequest.status !== undefined) post.status = updateRequest.status;
    if (updateRequest.scheduledFor !== undefined) post.scheduledFor = updateRequest.scheduledFor;

    await this.socialPostRepository.save(post);

    return this.mapPostToInterface(post);
  }

  async regenerateSocialPost(
    postId: string,
    regenerateRequest: RegenerateSocialPostRequest,
    userId: string
  ): Promise<ISocialMediaPost> {
    const post = await this.socialPostRepository.findOne({
      where: { id: postId },
      relations: ['contentPlan', 'blogPost', 'writerProfile']
    });

    if (!post) {
      throw new NotFoundException('Social media post not found');
    }

    // Regenerate content with new parameters
    const newAngle = regenerateRequest.angle || post.angle;
    const insights = this.extractInsightsFromBlogPost(post.blogPost);
    
    post.content = this.generatePostContent(
      post.blogPost,
      post.platform,
      post.writerProfile,
      newAngle,
      insights,
      0
    );

    if (regenerateRequest.includeMoreEmojis) {
      post.emojis = [...post.emojis, ...this.generateEmojis(post.platform, newAngle)];
    }

    post.angle = newAngle;
    post.characterCount = post.content.length;

    await this.socialPostRepository.save(post);

    return this.mapPostToInterface(post);
  }

  async deleteSocialPost(postId: string, userId: string): Promise<void> {
    const post = await this.socialPostRepository.findOne({
      where: { id: postId },
      relations: ['contentPlan']
    });

    if (!post) {
      throw new NotFoundException('Social media post not found');
    }

    if (post.contentPlan.userId !== userId) {
      throw new BadRequestException('Unauthorized to delete this post');
    }

    await this.socialPostRepository.remove(post);
  }

  private mapPostToInterface(post: SocialMediaPost): ISocialMediaPost {
    return {
      id: post.id,
      blogPostId: post.blogPostId,
      platform: post.platform,
      writerProfileId: post.writerProfileId,
      content: post.content,
      hashtags: post.hashtags,
      emojis: post.emojis,
      callToAction: post.callToAction,
      characterCount: post.characterCount,
      mediaType: post.mediaType,
      visualConcepts: post.visualConcepts,
      angle: post.angle,
      status: post.status,
      scheduledFor: post.scheduledFor,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };
  }

  private mapContentPlanToInterface(plan: SocialMediaContentPlan): ISocialMediaContentPlan {
    return {
      id: plan.id,
      blogPostId: plan.blogPostId,
      companyId: plan.companyId,
      userId: plan.userId,
      posts: plan.posts ? plan.posts.map(p => this.mapPostToInterface(p)) : [],
      selectedPlatforms: plan.selectedPlatforms,
      selectedWriterProfiles: plan.selectedWriterProfiles,
      publishingFrequency: plan.publishingFrequency,
      status: plan.status,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    };
  }
}