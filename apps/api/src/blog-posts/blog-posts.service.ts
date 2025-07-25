import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from '../database/entities/blog-post.entity';
import { BlogPostSection } from '../database/entities/blog-post-section.entity';
import { ContentTopic } from '../database/entities/content-topic.entity';
import { WriterProfile } from '../database/entities/writer-profile.entity';
import { Company } from '../database/entities/company.entity';
import {
  GenerateBlogPostRequest,
  GenerateBlogPostResponse,
  BlogPost as IBlogPost,
  BlogPostSection as IBlogPostSection,
  BlogPostOutline,
  UpdateBlogPostSectionRequest,
  RegenerateBlogPostSectionRequest,
  RegenerateBlogPostSectionResponse,
  DeleteBlogPostSectionResponse,
  ApproveBlogPostRequest
} from '@internal-marketing-content-app/shared';

@Injectable()
export class BlogPostsService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
    @InjectRepository(BlogPostSection)
    private readonly sectionRepository: Repository<BlogPostSection>,
    @InjectRepository(ContentTopic)
    private readonly contentTopicRepository: Repository<ContentTopic>,
    @InjectRepository(WriterProfile)
    private readonly writerProfileRepository: Repository<WriterProfile>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>
  ) {}

  async generateBlogPost(
    request: GenerateBlogPostRequest,
    userId: string
  ): Promise<GenerateBlogPostResponse> {
    // Get the content topic
    const contentTopic = await this.contentTopicRepository.findOne({
      where: { id: request.contentTopicId, userId },
      relations: ['category']
    });

    if (!contentTopic) {
      throw new NotFoundException('Content topic not found');
    }

    // Get company information
    const company = await this.companyRepository.findOne({
      where: { id: contentTopic.companyId }
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Get writer profile if specified
    let writerProfile = null;
    if (request.writerProfileId) {
      writerProfile = await this.writerProfileRepository.findOne({
        where: { id: request.writerProfileId, userId }
      });
    }

    // Generate blog post outline and content using AI
    const { blogPost, outline, sections } = await this.generateBlogContent(
      contentTopic,
      company,
      writerProfile,
      request
    );

    // Create blog post entity
    const newBlogPost = this.blogPostRepository.create({
      contentTopicId: request.contentTopicId,
      companyId: contentTopic.companyId,
      userId,
      writerProfileId: request.writerProfileId,
      title: blogPost.title,
      subtitle: blogPost.subtitle,
      excerpt: blogPost.excerpt,
      fullContent: this.assembleBlogContent(sections),
      status: 'outline_review',
      wordCount: this.calculateWordCount(sections),
      estimatedReadTime: this.calculateReadTime(sections),
      seoMetadata: blogPost.seoMetadata,
      tags: blogPost.tags
    });

    const savedBlogPost = await this.blogPostRepository.save(newBlogPost);

    // Create sections
    const blogPostSections = sections.map((section, index) =>
      this.sectionRepository.create({
        blogPostId: savedBlogPost.id,
        title: section.title,
        content: section.content,
        purpose: section.purpose,
        order: index + 1,
        status: 'pending',
        wordCount: section.content.split(' ').length
      })
    );

    await this.sectionRepository.save(blogPostSections);

    // Fetch the complete blog post with sections
    const completeBlogPost = await this.blogPostRepository.findOne({
      where: { id: savedBlogPost.id },
      relations: ['sections']
    });

    return {
      blogPost: this.mapToInterface(completeBlogPost!),
      outline,
      suggestions: {
        alternativeTitles: await this.generateAlternativeTitles(blogPost.title, contentTopic),
        additionalSections: await this.suggestAdditionalSections(contentTopic, company),
        relatedTopics: await this.findRelatedTopics(contentTopic, userId)
      }
    };
  }

  async getBlogPostsByCompany(companyId: string, userId: string): Promise<IBlogPost[]> {
    const blogPosts = await this.blogPostRepository.find({
      where: { companyId, userId },
      relations: ['sections'],
      order: { createdAt: 'DESC' }
    });

    return blogPosts.map(post => this.mapToInterface(post));
  }

  async getBlogPost(id: string, userId: string): Promise<IBlogPost> {
    const blogPost = await this.blogPostRepository.findOne({
      where: { id, userId },
      relations: ['sections']
    });

    if (!blogPost) {
      throw new NotFoundException('Blog post not found');
    }

    return this.mapToInterface(blogPost);
  }

  async updateBlogPostSection(
    blogPostId: string,
    sectionId: string,
    request: UpdateBlogPostSectionRequest,
    userId: string
  ): Promise<IBlogPostSection> {
    // Verify ownership
    const blogPost = await this.blogPostRepository.findOne({
      where: { id: blogPostId, userId }
    });

    if (!blogPost) {
      throw new ForbiddenException('Blog post not found or access denied');
    }

    const section = await this.sectionRepository.findOne({
      where: { id: sectionId, blogPostId }
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Update section
    Object.assign(section, request);
    
    if (request.content) {
      section.wordCount = request.content.split(' ').length;
    }

    const updatedSection = await this.sectionRepository.save(section);

    // Update blog post full content and word count
    await this.updateBlogPostContent(blogPostId);

    return this.mapSectionToInterface(updatedSection);
  }

  async regenerateBlogPostSection(
    blogPostId: string,
    sectionId: string,
    request: RegenerateBlogPostSectionRequest,
    userId: string
  ): Promise<IBlogPostSection> {
    // Verify ownership
    const blogPost = await this.blogPostRepository.findOne({
      where: { id: blogPostId, userId },
      relations: ['sections']
    });

    if (!blogPost) {
      throw new ForbiddenException('Blog post not found or access denied');
    }

    const section = await this.sectionRepository.findOne({
      where: { id: sectionId, blogPostId }
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Generate new content for the section
    const newContent = await this.generateSectionContent(
      section,
      blogPost,
      request
    );

    section.content = newContent;
    section.wordCount = newContent.split(' ').length;
    section.status = 'pending';

    const updatedSection = await this.sectionRepository.save(section);

    // Update blog post full content
    await this.updateBlogPostContent(blogPostId);

    return this.mapSectionToInterface(updatedSection);
  }


  async deleteBlogPost(id: string, userId: string): Promise<void> {
    const blogPost = await this.blogPostRepository.findOne({
      where: { id, userId }
    });

    if (!blogPost) {
      throw new NotFoundException('Blog post not found');
    }

    await this.blogPostRepository.remove(blogPost);
  }

  // AI Content Generation Methods
  private async generateBlogContent(
    contentTopic: ContentTopic,
    company: Company,
    writerProfile: WriterProfile | null,
    request: GenerateBlogPostRequest
  ) {
    const targetWordCount = request.targetWordCount || 2500;
    
    // Generate blog post outline
    const outline = await this.generateOutline(contentTopic, company, writerProfile, targetWordCount);
    
    // Generate sections based on outline
    const sections = await this.generateSections(outline, contentTopic, company, writerProfile);
    
    // Create blog post metadata
    const blogPost = {
      title: contentTopic.title,
      subtitle: `A comprehensive guide to ${contentTopic.title.toLowerCase()}`,
      excerpt: contentTopic.description.length > 200 
        ? contentTopic.description.substring(0, 200) + '...'
        : contentTopic.description,
      seoMetadata: {
        metaTitle: contentTopic.title + ` | ${company.name}`,
        metaDescription: contentTopic.description.substring(0, 160),
        focusKeywords: contentTopic.keywords,
        slug: this.generateSlug(contentTopic.title)
      },
      tags: [...contentTopic.keywords, contentTopic.category.name.toLowerCase()]
    };

    return { blogPost, outline, sections };
  }

  private async generateOutline(
    contentTopic: ContentTopic,
    company: Company,
    writerProfile: WriterProfile | null,
    targetWordCount: number
  ): Promise<BlogPostOutline> {
    // Mock AI-generated outline - in production this would call an AI service
    const sections = [
      {
        id: 'intro',
        title: 'Introduction',
        content: '',
        purpose: 'Hook the reader and introduce the main topic',
        order: 1,
        status: 'pending' as const,
        wordCount: Math.floor(targetWordCount * 0.1)
      },
      {
        id: 'background',
        title: 'Background and Context',
        content: '',
        purpose: 'Provide necessary background information',
        order: 2,
        status: 'pending' as const,
        wordCount: Math.floor(targetWordCount * 0.15)
      },
      {
        id: 'main-content',
        title: `Understanding ${contentTopic.title}`,
        content: '',
        purpose: 'Core content explaining the main concepts',
        order: 3,
        status: 'pending' as const,
        wordCount: Math.floor(targetWordCount * 0.4)
      },
      {
        id: 'practical-tips',
        title: 'Practical Tips and Best Practices',
        content: '',
        purpose: 'Actionable advice readers can implement',
        order: 4,
        status: 'pending' as const,
        wordCount: Math.floor(targetWordCount * 0.25)
      },
      {
        id: 'conclusion',
        title: 'Conclusion and Next Steps',
        content: '',
        purpose: 'Summarize key points and provide clear next actions',
        order: 5,
        status: 'pending' as const,
        wordCount: Math.floor(targetWordCount * 0.1)
      }
    ];

    return {
      id: 'outline-' + Date.now(),
      title: contentTopic.title,
      sections,
      estimatedWordCount: targetWordCount,
      estimatedReadTime: Math.ceil(targetWordCount / 200), // Average reading speed
      keyTakeaways: [
        `Understanding the fundamentals of ${contentTopic.title}`,
        'Practical implementation strategies',
        'Best practices and common pitfalls to avoid',
        'Next steps for continued learning'
      ],
      targetAudience: contentTopic.targetAudience || 'Business professionals',
      seoFocusKeywords: contentTopic.keywords
    };
  }

  private async generateSections(
    outline: BlogPostOutline,
    contentTopic: ContentTopic,
    company: Company,
    writerProfile: WriterProfile | null
  ) {
    // Mock content generation - in production this would use AI
    const sections = outline.sections.map(section => ({
      ...section,
      content: this.generateMockContent(section, contentTopic, company, writerProfile)
    }));

    return sections;
  }

  private generateMockContent(
    section: any,
    contentTopic: ContentTopic,
    company: Company,
    writerProfile: WriterProfile | null
  ): string {
    const writerTone = writerProfile?.tone || 'professional';
    const companyContext = `At ${company.name}, we understand the importance of ${contentTopic.title.toLowerCase()}.`;
    
    switch (section.purpose) {
      case 'Hook the reader and introduce the main topic':
        return `${companyContext} In today's rapidly evolving business landscape, ${contentTopic.title.toLowerCase()} has become increasingly crucial for organizations looking to stay competitive. This comprehensive guide will explore the key concepts, practical applications, and actionable strategies you need to succeed.\n\nWhether you're a seasoned professional or just starting your journey, this article will provide valuable insights that you can immediately apply to your work. Let's dive into the essential aspects of ${contentTopic.title.toLowerCase()} and discover how it can transform your approach to business.`;
      
      case 'Provide necessary background information':
        return `To fully understand ${contentTopic.title.toLowerCase()}, it's important to first examine the context and underlying factors that have shaped its evolution. The concept has its roots in [relevant industry/field], where professionals recognized the need for more effective approaches to [related challenge].\n\nOver the past decade, several key trends have emerged that make ${contentTopic.title.toLowerCase()} more relevant than ever:\n\n• Digital transformation initiatives across industries\n• Changing customer expectations and behaviors\n• Increased focus on data-driven decision making\n• The need for more agile and responsive business processes\n\nUnderstanding these foundational elements will help you appreciate why ${contentTopic.title.toLowerCase()} has become such a critical component of modern business strategy.`;
      
      case 'Core content explaining the main concepts':
        return `At its core, ${contentTopic.title.toLowerCase()} involves a systematic approach to [relevant process/methodology]. The fundamental principles include:\n\n**1. Strategic Planning and Goal Setting**\nSuccessful implementation begins with clear objectives and well-defined success metrics. Organizations must align their ${contentTopic.title.toLowerCase()} initiatives with broader business goals.\n\n**2. Process Optimization**\nStreamlining existing workflows and identifying areas for improvement is essential. This involves analyzing current practices, identifying bottlenecks, and implementing more efficient solutions.\n\n**3. Technology Integration**\nLeveraging the right tools and platforms can significantly enhance your ${contentTopic.title.toLowerCase()} efforts. Consider solutions that offer scalability, integration capabilities, and user-friendly interfaces.\n\n**4. Stakeholder Engagement**\nEnsuring buy-in from all relevant parties is crucial for success. This includes leadership support, team member involvement, and clear communication throughout the process.\n\n**5. Continuous Improvement**\nThe best ${contentTopic.title.toLowerCase()} strategies are those that evolve over time, incorporating feedback, new insights, and changing business requirements.`;
      
      case 'Actionable advice readers can implement':
        return `Now that we've covered the theoretical foundation, let's explore practical strategies you can implement immediately:\n\n**Getting Started Checklist:**\n✓ Assess your current state and identify specific areas for improvement\n✓ Set realistic, measurable goals with clear timelines\n✓ Assemble a cross-functional team with diverse perspectives\n✓ Develop a pilot program to test your approach on a smaller scale\n\n**Best Practices to Follow:**\n\n• **Start Small, Scale Gradually**: Begin with manageable projects that can demonstrate quick wins and build momentum.\n\n• **Measure Everything**: Establish baseline metrics and track progress regularly to ensure you're moving in the right direction.\n\n• **Foster a Culture of Learning**: Encourage experimentation and view setbacks as opportunities to learn and improve.\n\n• **Invest in Training**: Ensure your team has the necessary skills and knowledge to execute your ${contentTopic.title.toLowerCase()} strategy effectively.\n\n**Common Pitfalls to Avoid:**\n- Trying to do too much too quickly\n- Neglecting to secure adequate resources and support\n- Failing to communicate the value proposition clearly\n- Ignoring user feedback and resistance to change`;
      
      case 'Summarize key points and provide clear next actions':
        return `${contentTopic.title} represents a significant opportunity for organizations willing to invest in strategic implementation and continuous improvement. Throughout this guide, we've explored the essential elements that contribute to success in this area.\n\n**Key Takeaways:**\n• Understanding the foundational principles is crucial for effective implementation\n• Success requires a balanced approach combining strategy, technology, and people\n• Starting with pilot programs and scaling gradually reduces risk and increases chances of success\n• Continuous measurement and improvement are essential for long-term sustainability\n\n**Your Next Steps:**\n1. Conduct an assessment of your current capabilities and identify priority areas\n2. Develop a preliminary roadmap with specific milestones and success metrics\n3. Begin building support among key stakeholders and decision-makers\n4. Consider partnering with experienced professionals or organizations to accelerate your progress\n\nAt ${company.name}, we're committed to helping organizations succeed in their ${contentTopic.title.toLowerCase()} journey. Our team of experts can provide guidance, resources, and support to ensure your initiatives deliver meaningful results.\n\nReady to take the next step? Contact us today to learn more about how we can help you achieve your goals.`;
      
      default:
        return `This section provides important information about ${contentTopic.title.toLowerCase()}. Content will be tailored to your specific requirements and business context. Our AI-powered system generates comprehensive, relevant content that aligns with your company's voice and objectives.`;
    }
  }

  private async generateSectionContent(
    section: BlogPostSection,
    blogPost: BlogPost,
    request: RegenerateBlogPostSectionRequest
  ): Promise<string> {
    // Mock regeneration - in production this would use AI
    let newContent = section.content;
    
    if (request.length === 'shorter') {
      // Simulate shortening content
      const sentences = newContent.split('. ');
      newContent = sentences.slice(0, Math.ceil(sentences.length * 0.7)).join('. ');
    } else if (request.length === 'longer') {
      // Simulate expanding content
      newContent += '\n\nAdditional insights and details have been added to provide more comprehensive coverage of this topic. This expanded content includes more examples, deeper analysis, and additional practical applications that readers can implement in their own organizations.';
    }
    
    if (request.instructions) {
      newContent += `\n\n[Content regenerated with specific instructions: ${request.instructions}]`;
    }
    
    return newContent;
  }

  // Helper methods
  private assembleBlogContent(sections: any[]): string {
    return sections
      .sort((a, b) => a.order - b.order)
      .map(section => `## ${section.title}\n\n${section.content}`)
      .join('\n\n');
  }

  private calculateWordCount(sections: any[]): number {
    return sections.reduce((total, section) => {
      return total + (section.content ? section.content.split(' ').length : 0);
    }, 0);
  }

  private calculateReadTime(sections: any[]): number {
    const wordCount = this.calculateWordCount(sections);
    return Math.ceil(wordCount / 200); // Average reading speed of 200 WPM
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async generateAlternativeTitles(
    currentTitle: string,
    contentTopic: ContentTopic
  ): Promise<string[]> {
    // Mock alternative titles
    return [
      `The Complete Guide to ${currentTitle}`,
      `${currentTitle}: Best Practices and Strategies`,
      `Mastering ${currentTitle} in 2024`,
      `${currentTitle} Explained: A Practical Approach`,
      `Why ${currentTitle} Matters for Your Business`
    ];
  }

  private async suggestAdditionalSections(
    contentTopic: ContentTopic,
    company: Company
  ): Promise<string[]> {
    // Mock additional section suggestions
    return [
      'Case Study: Real-World Implementation',
      'ROI Analysis and Business Impact',
      'Future Trends and Predictions',
      'Expert Interviews and Insights',
      'Frequently Asked Questions'
    ];
  }

  private async findRelatedTopics(
    contentTopic: ContentTopic,
    userId: string
  ): Promise<string[]> {
    // Mock related topics
    return [
      `Advanced ${contentTopic.title} Strategies`,
      `${contentTopic.title} vs Traditional Approaches`,
      `Measuring ${contentTopic.title} Success`,
      `Common ${contentTopic.title} Mistakes to Avoid`,
      `${contentTopic.title} Tools and Resources`
    ];
  }

  private async updateBlogPostContent(blogPostId: string): Promise<void> {
    const blogPost = await this.blogPostRepository.findOne({
      where: { id: blogPostId },
      relations: ['sections']
    });

    if (blogPost) {
      blogPost.fullContent = this.assembleBlogContent(blogPost.sections);
      blogPost.wordCount = this.calculateWordCount(blogPost.sections);
      blogPost.estimatedReadTime = this.calculateReadTime(blogPost.sections);
      await this.blogPostRepository.save(blogPost);
    }
  }

  private mapToInterface(blogPost: BlogPost): IBlogPost {
    return {
      id: blogPost.id,
      contentTopicId: blogPost.contentTopicId,
      companyId: blogPost.companyId,
      userId: blogPost.userId,
      writerProfileId: blogPost.writerProfileId,
      title: blogPost.title,
      subtitle: blogPost.subtitle,
      excerpt: blogPost.excerpt,
      outline: {
        id: 'outline-' + blogPost.id,
        title: blogPost.title,
        sections: blogPost.sections.map(s => this.mapSectionToInterface(s)),
        estimatedWordCount: blogPost.wordCount,
        estimatedReadTime: blogPost.estimatedReadTime,
        keyTakeaways: ['Key insights from the blog post'],
        targetAudience: 'Business professionals',
        seoFocusKeywords: blogPost.seoMetadata.focusKeywords
      },
      fullContent: blogPost.fullContent,
      status: blogPost.status,
      sections: blogPost.sections.map(s => this.mapSectionToInterface(s)),
      wordCount: blogPost.wordCount,
      targetWordCount: blogPost.targetWordCount,
      estimatedReadTime: blogPost.estimatedReadTime,
      seoMetadata: blogPost.seoMetadata,
      tags: blogPost.tags || [],
      publishedAt: blogPost.publishedAt,
      createdAt: blogPost.createdAt,
      updatedAt: blogPost.updatedAt
    };
  }

  private mapSectionToInterface(section: BlogPostSection): IBlogPostSection {
    return {
      id: section.id,
      title: section.title,
      content: section.content,
      purpose: section.purpose,
      order: section.order,
      status: section.status,
      wordCount: section.wordCount,
      suggestions: section.suggestions
    };
  }

  async regenerateSection(
    blogPostId: string,
    sectionId: string,
    regenerateRequest: RegenerateBlogPostSectionRequest,
    userId: string
  ): Promise<RegenerateBlogPostSectionResponse> {
    const blogPost = await this.blogPostRepository.findOne({
      where: { id: blogPostId, userId },
      relations: ['sections', 'contentTopic', 'writerProfile', 'company']
    });

    if (!blogPost) {
      throw new NotFoundException('Blog post not found');
    }

    const section = blogPost.sections.find(s => s.id === sectionId);
    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Mock regenerating section content
    const { instructions, tone, length } = regenerateRequest;
    
    let newContent = section.content;
    let wordCount = section.wordCount || 300;

    // Adjust length if requested
    if (length === 'shorter') {
      wordCount = Math.floor(wordCount * 0.7);
    } else if (length === 'longer') {
      wordCount = Math.floor(wordCount * 1.3);
    }

    // Generate new content based on instructions
    // Mock generation since we're using different parameters now
    const toneText = tone || blogPost.writerProfile?.tone || 'professional';
    const instructionText = instructions ? `Following instructions: ${instructions}. ` : '';
    
    const contentTemplates = {
      introduction: `${instructionText}In today's rapidly evolving ${blogPost.company.industry} landscape, ${blogPost.contentTopic.title.toLowerCase()} has become a critical focus area. This section explores the fundamental aspects and strategic importance for modern businesses.`,
      'main-point': `${instructionText}The core principle of ${section.title} centers around delivering measurable value. Research indicates that companies implementing these strategies see significant improvements in key performance metrics.`,
      example: `${instructionText}Consider the case of a leading ${blogPost.company.industry} company that successfully implemented ${blogPost.contentTopic.title.toLowerCase()}. Their approach demonstrates the practical application of these concepts.`,
      conclusion: `${instructionText}As we've explored throughout this discussion, ${blogPost.contentTopic.title.toLowerCase()} represents a significant opportunity for growth and innovation. The key is to start with a clear strategy and measurable goals.`
    };

    let baseContent = contentTemplates[section.purpose.toLowerCase()] || contentTemplates['main-point'];
    
    if (toneText === 'casual') {
      baseContent = baseContent.replace(/companies/g, 'teams')
        .replace(/businesses/g, 'organizations')
        .replace(/significant/g, 'awesome');
    }

    const words = baseContent.split(' ');
    while (words.length < wordCount) {
      words.push(...'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(' '));
    }

    newContent = words.slice(0, wordCount).join(' ');

    // Update section
    section.content = newContent;
    section.wordCount = newContent.split(' ').length;
    section.suggestions = [
      'Consider adding specific examples',
      'Include relevant statistics or data',
      'Add a compelling call-to-action'
    ];

    await this.sectionRepository.save(section);

    return {
      section: this.mapSectionToInterface(section),
      message: 'Section regenerated successfully'
    };
  }

  async deleteSection(
    blogPostId: string,
    sectionId: string,
    userId: string
  ): Promise<DeleteBlogPostSectionResponse> {
    const blogPost = await this.blogPostRepository.findOne({
      where: { id: blogPostId, userId },
      relations: ['sections']
    });

    if (!blogPost) {
      throw new NotFoundException('Blog post not found');
    }

    const sectionIndex = blogPost.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      throw new NotFoundException('Section not found');
    }

    // Remove the section
    const [removedSection] = blogPost.sections.splice(sectionIndex, 1);
    
    // Reorder remaining sections
    blogPost.sections.forEach((section, index) => {
      section.order = index + 1;
    });

    // Update word count
    blogPost.wordCount = this.calculateWordCount(blogPost.sections);
    blogPost.estimatedReadTime = this.calculateReadTime(blogPost.sections);

    // Delete the section and save blog post
    await this.sectionRepository.remove(removedSection);
    await this.blogPostRepository.save(blogPost);

    return {
      success: true,
      message: 'Section deleted successfully'
    };
  }

  async approveBlogPost(
    blogPostId: string,
    approveRequest: ApproveBlogPostRequest,
    userId: string
  ): Promise<IBlogPost> {
    const blogPost = await this.blogPostRepository.findOne({
      where: { id: blogPostId, userId },
      relations: ['sections', 'contentTopic', 'company', 'user', 'writerProfile']
    });

    if (!blogPost) {
      throw new NotFoundException('Blog post not found');
    }

    // Check if all sections are approved
    const allSectionsApproved = blogPost.sections.every(
      section => section.status === 'approved'
    );

    if (!allSectionsApproved && approveRequest.status === 'approved') {
      throw new BadRequestException(
        'All sections must be approved before approving the blog post'
      );
    }

    // Update status
    blogPost.status = approveRequest.status;
    
    if (approveRequest.status === 'published') {
      blogPost.publishedAt = new Date();
    }

    await this.blogPostRepository.save(blogPost);

    return this.mapToInterface(blogPost);
  }

}