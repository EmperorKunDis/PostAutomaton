import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
  ContentTopic, 
  GenerateContentTopicsRequest, 
  GenerateContentTopicsResponse,
  UpdateContentTopicRequest,
  DEFAULT_TOPIC_CATEGORIES,
  TopicCategory,
  SeasonalEvent,
  ContentGoal
} from '@internal-marketing-content-app/shared';
import { ContentTopicEntity } from '../database/entities/content-topic.entity';
import { User } from '../database/entities/user.entity';
import { Company } from '../database/entities/company.entity';
import { WriterProfile } from '../database/entities/writer-profile.entity';

@Injectable()
export class ContentTopicsService {
  private readonly logger = new Logger(ContentTopicsService.name);

  constructor(
    @InjectRepository(ContentTopicEntity)
    private contentTopicsRepository: Repository<ContentTopicEntity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(WriterProfile)
    private writerProfileRepository: Repository<WriterProfile>,
  ) {}

  async generateContentTopics(
    userId: string,
    request: GenerateContentTopicsRequest
  ): Promise<GenerateContentTopicsResponse> {
    this.logger.log(`Generating content topics for user ${userId}, company ${request.companyId}, year ${request.year}`);

    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify company exists
    const company = await this.companyRepository.findOne({ 
      where: { id: request.companyId } 
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Get writer profiles for the company (optional)
    const writerProfiles = await this.writerProfileRepository.find({
      where: { companyId: request.companyId }
    });

    // Generate topics using AI-powered logic
    const topicsPerMonth = request.monthlyTopicCount || 4;
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    
    const generatedTopics: ContentTopic[] = [];
    
    for (const month of months) {
      for (let i = 0; i < topicsPerMonth; i++) {
        const topic = await this.generateTopicForMonth(
          request,
          company,
          writerProfiles,
          month,
          i
        );
        
        // Create and save the topic entity
        const topicEntity = this.contentTopicsRepository.create({
          ...topic,
          companyId: request.companyId,
          userId,
        });
        
        const savedTopic = await this.contentTopicsRepository.save(topicEntity);
        generatedTopics.push(savedTopic);
      }
    }

    // Generate suggestions
    const suggestions = {
      recommendedCategories: this.getRecommendedCategories(company, request.contentGoals),
      seasonalOpportunities: this.getSeasonalOpportunities(request.year),
      keywordOpportunities: this.generateKeywordOpportunities(company, request.contentGoals)
    };

    return {
      topics: generatedTopics,
      plan: {
        name: `${company.name} Content Plan ${request.year}`,
        description: `Annual content strategy for ${company.name} focusing on ${request.contentGoals.join(', ')}`,
        year: request.year,
        companyId: request.companyId,
        userId,
        topics: generatedTopics,
        goals: request.contentGoals,
        status: 'draft'
      },
      suggestions
    };
  }

  private async generateTopicForMonth(
    request: GenerateContentTopicsRequest,
    company: Company,
    writerProfiles: WriterProfile[],
    month: number,
    topicIndex: number
  ): Promise<Omit<ContentTopic, 'id' | 'companyId' | 'userId' | 'createdAt' | 'updatedAt'>> {
    // Use provided categories
    const categories = request.categories.length > 0 ? request.categories : DEFAULT_TOPIC_CATEGORIES;
    
    const category = categories[topicIndex % categories.length];
    
    // Generate topic based on month, category, and company context
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[month - 1];
    
    // Simple topic generation based on category and month
    const topicTemplates = {
      'product': [
        `New ${monthName} Product Features and Updates`,
        `How Our Product Solves ${monthName} Challenges`,
        `${monthName} Product Roadmap and Innovations`,
        `Customer Success with Our Product in ${monthName}`
      ],
      'behind-scenes': [
        `Behind the Scenes: ${monthName} at ${company.name}`,
        `Team Spotlight: ${monthName} Employee Stories`,
        `Our ${monthName} Company Culture and Values`,
        `Day in the Life: ${monthName} at ${company.name}`
      ],
      'thought-leadership': [
        `${monthName} Industry Trends and Predictions`,
        `Expert Insights: ${monthName} Market Analysis`,
        `The Future of Industry in ${monthName}`,
        `${monthName} Innovation and Technology Trends`
      ],
      'customer-success': [
        `${monthName} Customer Success Stories`,
        `Client Testimonials: ${monthName} Highlights`,
        `Case Study: ${monthName} Implementation Success`,
        `Customer Journey: ${monthName} Transformation`
      ],
      'education': [
        `${monthName} Best Practices and Tips`,
        `How-to Guide: ${monthName} Implementation`,
        `${monthName} Tutorial: Step-by-Step Guide`,
        `Learning Resources for ${monthName}`
      ],
      'company-news': [
        `${monthName} Company Announcements`,
        `${monthName} Milestones and Achievements`,
        `Company Updates: ${monthName} Progress`,
        `${monthName} News and Press Releases`
      ]
    };

    const templates = topicTemplates[category.id] || topicTemplates['product'];
    const title = templates[topicIndex % templates.length];
    
    // Generate description based on title and company
    const description = `Comprehensive content piece focusing on ${title.toLowerCase()} for ${company.name}. This ${category.name.toLowerCase()} content will engage our target audience and support our content marketing goals.`;
    
    // Generate keywords based on category and company
    const baseKeywords = [
      company.name.toLowerCase(),
      category.name.toLowerCase().replace(' ', '-'),
      monthName.toLowerCase(),
      company.industry?.toLowerCase() || 'business'
    ];
    
    // Add seasonal keywords if applicable
    const seasonalKeywords = this.getSeasonalKeywords(month);
    const keywords = [...baseKeywords, ...seasonalKeywords];
    
    // Generate SEO keywords
    const seoKeywords = [
      `${company.name} ${category.name.toLowerCase()}`,
      `${company.industry || 'business'} ${monthName.toLowerCase()}`,
      ...keywords
    ];

    // Assign writer profile if available
    const writerProfileId = writerProfiles.length > 0 
      ? writerProfiles[topicIndex % writerProfiles.length].id 
      : undefined;

    return {
      title,
      description,
      category,
      keywords: keywords.slice(0, 8), // Limit to 8 keywords
      plannedMonth: month,
      plannedYear: request.year,
      priority: this.determinePriority(month, topicIndex, request.contentGoals),
      status: 'planned',
      writerProfileId,
      seasonalEvents: this.getSeasonalEventsForMonth(month),
      targetAudience: this.generateTargetAudience(company, category),
      seoKeywords: seoKeywords.slice(0, 10), // Limit to 10 SEO keywords
      estimatedReadTime: this.estimateReadingTime(category),
      contentGoals: request.contentGoals // Add required contentGoals field
    };
  }

  private getRecommendedCategories(company: Company, goals: ContentGoal[]): TopicCategory[] {
    // Return categories based on company industry and goals
    const relevantCategories = DEFAULT_TOPIC_CATEGORIES.filter(category => {
      if (goals.some(g => g === 'product_promotion')) {
        return ['product', 'customer-success'].includes(category.id);
      }
      if (goals.some(g => g === 'thought_leadership')) {
        return ['thought-leadership', 'education'].includes(category.id);
      }
      if (goals.some(g => g === 'brand_awareness')) {
        return ['behind-scenes', 'company-news'].includes(category.id);
      }
      return true;
    });
    
    return relevantCategories.length > 0 ? relevantCategories : DEFAULT_TOPIC_CATEGORIES;
  }

  private getSeasonalOpportunities(year: number): SeasonalEvent[] {
    return [
      {
        id: 'new-year',
        name: 'New Year Planning',
        date: `${year}-01-01`,
        type: 'holiday',
        description: 'New Year resolutions and planning content opportunities'
      },
      {
        id: 'valentines',
        name: "Valentine's Day",
        date: `${year}-02-14`,
        type: 'holiday',
        description: 'Love-themed content and customer appreciation'
      },
      {
        id: 'spring-launch',
        name: 'Spring Product Launch Season',
        date: `${year}-03-21`,
        type: 'product_cycle',
        description: 'Spring product launches and fresh starts'
      },
      {
        id: 'earth-day',
        name: 'Earth Day',
        date: `${year}-04-22`,
        type: 'awareness_day',
        description: 'Sustainability and environmental awareness content'
      },
      {
        id: 'summer-campaigns',
        name: 'Summer Campaign Season',
        date: `${year}-06-21`,
        type: 'product_cycle',
        description: 'Summer marketing campaigns and outdoor activities'
      },
      {
        id: 'back-to-school',
        name: 'Back to School',
        date: `${year}-09-01`,
        type: 'product_cycle',
        description: 'Education-focused content and productivity themes'
      },
      {
        id: 'halloween',
        name: 'Halloween',
        date: `${year}-10-31`,
        type: 'holiday',
        description: 'Creative and fun content opportunities'
      },
      {
        id: 'black-friday',
        name: 'Black Friday',
        date: `${year}-11-29`,
        type: 'product_cycle',
        description: 'Shopping season and promotional content'
      },
      {
        id: 'year-end',
        name: 'Year-End Reflection',
        date: `${year}-12-31`,
        type: 'awareness_day',
        description: 'Year in review and future planning content'
      }
    ];
  }

  private generateKeywordOpportunities(company: Company, goals: ContentGoal[]): string[] {
    const baseKeywords = [
      company.name,
      company.industry || 'business',
      'content marketing',
      'digital strategy'
    ];

    const goalKeywords = goals.flatMap(goal => {
      switch (goal) {
        case 'brand_awareness':
          return ['brand building', 'awareness campaign', 'brand recognition'];
        case 'thought_leadership':
          return ['industry insights', 'expert opinion', 'market trends'];
        case 'product_promotion':
          return ['product launch', 'features', 'benefits', 'solutions'];
        case 'recruitment':
          return ['careers', 'job opportunities', 'company culture'];
        case 'lead_generation':
          return ['conversion', 'prospects', 'customer acquisition'];
        default:
          return [];
      }
    });

    return [...baseKeywords, ...goalKeywords];
  }

  private getSeasonalKeywords(month: number): string[] {
    const seasonalKeywords = {
      1: ['new-year', 'resolutions', 'planning', 'goals'],
      2: ['valentine', 'love', 'relationships', 'appreciation'],
      3: ['spring', 'renewal', 'growth', 'fresh-start'],
      4: ['april', 'earth-day', 'sustainability', 'green'],
      5: ['may', 'mothers-day', 'appreciation', 'spring'],
      6: ['summer', 'vacation', 'outdoor', 'travel'],
      7: ['july', 'independence', 'freedom', 'celebration'],
      8: ['august', 'back-to-school', 'preparation', 'learning'],
      9: ['september', 'autumn', 'harvest', 'productivity'],
      10: ['october', 'halloween', 'spooky', 'creative'],
      11: ['november', 'thanksgiving', 'gratitude', 'black-friday'],
      12: ['december', 'holiday', 'year-end', 'celebration']
    };

    return seasonalKeywords[month] || [];
  }

  private getSeasonalEventsForMonth(month: number): string[] {
    const events = {
      1: ['New Year', 'CES', 'Planning Season'],
      2: ['Valentine\'s Day', 'Presidents Day'],
      3: ['Spring Equinox', 'Women\'s History Month'],
      4: ['Earth Day', 'Easter'],
      5: ['Mother\'s Day', 'Memorial Day'],
      6: ['Summer Solstice', 'Father\'s Day'],
      7: ['Independence Day', 'Summer Holidays'],
      8: ['Back to School', 'Summer\'s End'],
      9: ['Labor Day', 'Autumn Equinox'],
      10: ['Halloween', 'Breast Cancer Awareness'],
      11: ['Thanksgiving', 'Black Friday', 'Cyber Monday'],
      12: ['Christmas', 'New Year Prep', 'Year End']
    };

    return events[month] || [];
  }

  private determinePriority(month: number, topicIndex: number, goals: ContentGoal[]): 'high' | 'medium' | 'low' {
    // High priority for key business months and important goals
    const keyMonths = [1, 3, 6, 9, 12]; // Quarter starts and year end
    const hasHighPriorityGoals = goals.some(g => 
      ['product_promotion', 'lead_generation'].includes(g)
    );

    if (keyMonths.includes(month) && hasHighPriorityGoals) {
      return 'high';
    } else if (topicIndex === 0) { // First topic of each month
      return 'high';
    } else if (topicIndex === 1) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private generateTargetAudience(company: Company, category: TopicCategory): string {
    const audiences = {
      'product': `${company.industry || 'Business'} professionals looking for solutions`,
      'behind-scenes': `${company.name} community and potential employees`,
      'thought-leadership': `Industry leaders and decision-makers in ${company.industry || 'business'}`,
      'customer-success': `Prospects and existing customers interested in success stories`,
      'education': `Professionals seeking to learn about ${company.industry || 'business'} best practices`,
      'company-news': `Stakeholders, customers, and industry observers`
    };

    return audiences[category.id] || `General ${company.industry || 'business'} audience`;
  }

  private estimateReadingTime(category: TopicCategory): number {
    const readingTimes = {
      'product': 7, // Product content tends to be detailed
      'behind-scenes': 5, // More casual, shorter reads
      'thought-leadership': 10, // In-depth analysis
      'customer-success': 8, // Detailed case studies
      'education': 12, // Comprehensive guides
      'company-news': 3 // Brief announcements
    };

    return readingTimes[category.id] || 6;
  }

  async getContentTopics(userId: string, companyId?: string): Promise<ContentTopic[]> {
    const query = this.contentTopicsRepository
      .createQueryBuilder('topic')
      .where('topic.userId = :userId', { userId });

    if (companyId) {
      query.andWhere('topic.companyId = :companyId', { companyId });
    }

    return query
      .orderBy('topic.plannedYear', 'DESC')
      .addOrderBy('topic.plannedMonth', 'ASC')
      .addOrderBy('topic.priority', 'ASC')
      .getMany();
  }

  async getContentTopic(userId: string, topicId: string): Promise<ContentTopic> {
    const topic = await this.contentTopicsRepository.findOne({
      where: { id: topicId, userId }
    });

    if (!topic) {
      throw new NotFoundException('Content topic not found');
    }

    return topic;
  }

  async updateContentTopic(
    userId: string, 
    topicId: string, 
    updateData: UpdateContentTopicRequest
  ): Promise<ContentTopic> {
    const topic = await this.contentTopicsRepository.findOne({
      where: { id: topicId, userId }
    });

    if (!topic) {
      throw new NotFoundException('Content topic not found');
    }

    // Validate writer profile if provided
    if (updateData.writerProfileId) {
      const writerProfile = await this.writerProfileRepository.findOne({
        where: { 
          id: updateData.writerProfileId, 
          companyId: topic.companyId 
        }
      });

      if (!writerProfile) {
        throw new BadRequestException('Writer profile not found or does not belong to the company');
      }
    }

    Object.assign(topic, updateData);
    return this.contentTopicsRepository.save(topic);
  }

  async deleteContentTopic(userId: string, topicId: string): Promise<void> {
    const topic = await this.contentTopicsRepository.findOne({
      where: { id: topicId, userId }
    });

    if (!topic) {
      throw new NotFoundException('Content topic not found');
    }

    await this.contentTopicsRepository.remove(topic);
  }
}