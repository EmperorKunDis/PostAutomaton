import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentOptimizationSuggestion } from '../../database/entities/content-optimization-suggestion.entity';
import { OptimizationRule } from '../../database/entities/optimization-rule.entity';
import { AIModelService } from './ai-model.service';
import { ContentMetricsService } from '../../analytics/services/content-metrics.service';
import { 
  OptimizeContentRequest,
  ContentOptimizationResponse,
  CreateOptimizationRuleRequest,
  OptimizationCategory,
  OptimizationPriority,
  ContentAnalyticsEntityType,
  SuggestionStatus
} from '@internal-marketing-content-app/shared';

@Injectable()
export class ContentOptimizationService {
  constructor(
    @InjectRepository(ContentOptimizationSuggestion)
    private suggestionRepository: Repository<ContentOptimizationSuggestion>,
    
    @InjectRepository(OptimizationRule)
    private ruleRepository: Repository<OptimizationRule>,
    
    private aiModelService: AIModelService,
    private contentMetricsService: ContentMetricsService,
  ) {}

  async optimizeContent(request: OptimizeContentRequest): Promise<ContentOptimizationResponse> {
    // Get historical performance data for context
    const performanceData = await this.getContentPerformanceContext(
      request.companyId,
      request.entityType,
      request.entityId
    );

    // Get applicable optimization rules
    const rules = await this.getApplicableRules(
      request.companyId,
      request.entityType,
      request.optimizationGoals
    );

    // Generate AI-powered suggestions
    const aiSuggestions = await this.generateAISuggestions(request, performanceData);

    // Generate rule-based suggestions
    const ruleSuggestions = await this.generateRuleBasedSuggestions(request, rules);

    // Combine and rank suggestions
    const allSuggestions = [...aiSuggestions, ...ruleSuggestions];
    const rankedSuggestions = this.rankSuggestions(allSuggestions, request.optimizationGoals);

    // Save suggestions to database
    const savedSuggestions = await this.saveSuggestions(
      request.companyId,
      request.entityType,
      request.entityId,
      rankedSuggestions
    );

    // Generate optimization score
    const optimizationScore = this.calculateOptimizationScore(request.content, savedSuggestions);

    // Generate insights
    const insights = this.generateOptimizationInsights(
      savedSuggestions,
      performanceData,
      optimizationScore
    );

    return {
      entityId: request.entityId,
      entityType: request.entityType,
      optimizationScore,
      suggestions: savedSuggestions,
      insights,
      performanceContext: performanceData,
      estimatedImpact: this.estimateImpact(savedSuggestions, performanceData),
    };
  }

  async getSuggestions(
    companyId: string,
    entityType?: ContentAnalyticsEntityType,
    entityId?: string,
    status?: SuggestionStatus
  ): Promise<ContentOptimizationSuggestion[]> {
    const query = this.suggestionRepository
      .createQueryBuilder('suggestion')
      .where('suggestion.companyId = :companyId', { companyId })
      .orderBy('suggestion.createdAt', 'DESC');

    if (entityType) {
      query.andWhere('suggestion.entityType = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('suggestion.entityId = :entityId', { entityId });
    }

    if (status) {
      query.andWhere('suggestion.status = :status', { status });
    }

    return query.getMany();
  }

  async updateSuggestionStatus(
    suggestionId: string,
    companyId: string,
    status: SuggestionStatus,
    feedback?: string
  ): Promise<ContentOptimizationSuggestion> {
    const suggestion = await this.suggestionRepository.findOne({
      where: { id: suggestionId, companyId },
    });

    if (!suggestion) {
      throw new Error('Optimization suggestion not found');
    }

    suggestion.status = status;
    suggestion.feedback = feedback;
    suggestion.reviewedAt = new Date();

    return this.suggestionRepository.save(suggestion);
  }

  async createOptimizationRule(request: CreateOptimizationRuleRequest): Promise<OptimizationRule> {
    const rule = this.ruleRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      name: request.name,
      description: request.description,
      category: request.category,
      priority: request.priority,
      conditions: request.conditions,
      actions: request.actions,
      applicableEntityTypes: request.applicableEntityTypes,
      isActive: true,
    });

    return this.ruleRepository.save(rule);
  }

  async getOptimizationRules(companyId: string, category?: OptimizationCategory): Promise<OptimizationRule[]> {
    const query = this.ruleRepository
      .createQueryBuilder('rule')
      .where('rule.companyId = :companyId', { companyId })
      .andWhere('rule.isActive = :isActive', { isActive: true })
      .orderBy('rule.priority', 'DESC');

    if (category) {
      query.andWhere('rule.category = :category', { category });
    }

    return query.getMany();
  }

  async getBulkOptimizationSuggestions(
    companyId: string,
    entityType: ContentAnalyticsEntityType,
    limit: number = 50
  ): Promise<{
    suggestions: Array<{
      entityId: string;
      entityTitle: string;
      optimizationScore: number;
      topSuggestions: ContentOptimizationSuggestion[];
      estimatedImpact: {
        viewsIncrease: number;
        engagementIncrease: number;
        conversionIncrease: number;
      };
    }>;
    summary: {
      totalContent: number;
      optimizable: number;
      avgOptimizationScore: number;
      potentialImpact: {
        totalViewsIncrease: number;
        totalEngagementIncrease: number;
        totalConversionIncrease: number;
      };
    };
  }> {
    // Mock bulk optimization - in real implementation, process multiple content pieces
    const suggestions = [];
    
    for (let i = 0; i < Math.min(limit, 20); i++) {
      const entityId = `content_${i + 1}`;
      const optimizationScore = 60 + Math.random() * 35; // 60-95%
      
      const topSuggestions = await this.generateMockSuggestions(
        companyId,
        entityType,
        entityId,
        3 // Top 3 suggestions
      );

      const estimatedImpact = this.estimateImpact(topSuggestions, {
        currentViews: Math.floor(Math.random() * 5000) + 1000,
        currentEngagement: Math.floor(Math.random() * 200) + 50,
        currentConversions: Math.floor(Math.random() * 20) + 5,
      });

      suggestions.push({
        entityId,
        entityTitle: `Sample Content ${i + 1}`,
        optimizationScore,
        topSuggestions,
        estimatedImpact,
      });
    }

    // Calculate summary
    const totalContent = suggestions.length;
    const optimizable = suggestions.filter(s => s.optimizationScore < 85).length;
    const avgOptimizationScore = suggestions.reduce((sum, s) => sum + s.optimizationScore, 0) / totalContent;
    
    const potentialImpact = suggestions.reduce((acc, s) => ({
      totalViewsIncrease: acc.totalViewsIncrease + s.estimatedImpact.viewsIncrease,
      totalEngagementIncrease: acc.totalEngagementIncrease + s.estimatedImpact.engagementIncrease,
      totalConversionIncrease: acc.totalConversionIncrease + s.estimatedImpact.conversionIncrease,
    }), { totalViewsIncrease: 0, totalEngagementIncrease: 0, totalConversionIncrease: 0 });

    return {
      suggestions,
      summary: {
        totalContent,
        optimizable,
        avgOptimizationScore: parseFloat(avgOptimizationScore.toFixed(1)),
        potentialImpact,
      },
    };
  }

  private async getContentPerformanceContext(
    companyId: string,
    entityType: ContentAnalyticsEntityType,
    entityId?: string
  ): Promise<{
    currentViews: number;
    currentEngagement: number;
    currentConversions: number;
    benchmarkViews?: number;
    benchmarkEngagement?: number;
    benchmarkConversions?: number;
  }> {
    if (entityId) {
      // Get specific content performance
      const engagement = await this.contentMetricsService.getEngagementMetrics(
        companyId,
        entityType,
        entityId
      );

      const conversions = await this.contentMetricsService.getConversionMetrics(
        companyId,
        entityType,
        entityId
      );

      return {
        currentViews: engagement.views,
        currentEngagement: engagement.likes + engagement.shares + engagement.comments,
        currentConversions: conversions.conversions,
        benchmarkViews: engagement.views * 1.2, // Mock benchmark
        benchmarkEngagement: (engagement.likes + engagement.shares + engagement.comments) * 1.3,
        benchmarkConversions: conversions.conversions * 1.15,
      };
    }

    // Return average performance for content type
    return {
      currentViews: Math.floor(Math.random() * 3000) + 500,
      currentEngagement: Math.floor(Math.random() * 150) + 30,
      currentConversions: Math.floor(Math.random() * 15) + 3,
      benchmarkViews: Math.floor(Math.random() * 4000) + 800,
      benchmarkEngagement: Math.floor(Math.random() * 200) + 50,
      benchmarkConversions: Math.floor(Math.random() * 20) + 5,
    };
  }

  private async getApplicableRules(
    companyId: string,
    entityType: ContentAnalyticsEntityType,
    optimizationGoals: string[]
  ): Promise<OptimizationRule[]> {
    return this.ruleRepository
      .createQueryBuilder('rule')
      .where('rule.companyId = :companyId', { companyId })
      .andWhere('rule.isActive = :isActive', { isActive: true })
      .andWhere(':entityType = ANY(rule.applicableEntityTypes)', { entityType })
      .orderBy('rule.priority', 'DESC')
      .getMany();
  }

  private async generateAISuggestions(
    request: OptimizeContentRequest,
    performanceData: any
  ): Promise<Array<Omit<ContentOptimizationSuggestion, 'id' | 'createdAt' | 'updatedAt'>>> {
    // Use AI model to generate suggestions based on content analysis
    const suggestions = [];

    // Title optimization
    if (request.content.title) {
      const titleSuggestion = await this.analyzeTitle(request.content.title, performanceData);
      if (titleSuggestion) {
        suggestions.push({
          category: 'seo' as OptimizationCategory,
          type: 'title_optimization',
          priority: 'high' as OptimizationPriority,
          title: 'Optimize Title for Better Engagement',
          description: titleSuggestion.description,
          suggestion: titleSuggestion.suggestion,
          reasoning: titleSuggestion.reasoning,
          expectedImpact: titleSuggestion.expectedImpact,
          implementationEffort: 'low',
          status: 'pending' as SuggestionStatus,
          source: 'ai_model',
          confidence: titleSuggestion.confidence,
        });
      }
    }

    // Content structure optimization
    if (request.content.body || request.content.content) {
      const structureSuggestion = await this.analyzeContentStructure(
        request.content.body || request.content.content,
        performanceData
      );
      if (structureSuggestion) {
        suggestions.push({
          category: 'readability' as OptimizationCategory,
          type: 'structure_optimization',
          priority: 'medium' as OptimizationPriority,
          title: 'Improve Content Structure',
          description: structureSuggestion.description,
          suggestion: structureSuggestion.suggestion,
          reasoning: structureSuggestion.reasoning,
          expectedImpact: structureSuggestion.expectedImpact,
          implementationEffort: 'medium',
          status: 'pending' as SuggestionStatus,
          source: 'ai_model',
          confidence: structureSuggestion.confidence,
        });
      }
    }

    // SEO optimization
    const seoSuggestion = await this.analyzeSEO(request.content, performanceData);
    if (seoSuggestion) {
      suggestions.push({
        category: 'seo' as OptimizationCategory,
        type: 'keyword_optimization',
        priority: 'high' as OptimizationPriority,
        title: 'Enhance SEO Performance',
        description: seoSuggestion.description,
        suggestion: seoSuggestion.suggestion,
        reasoning: seoSuggestion.reasoning,
        expectedImpact: seoSuggestion.expectedImpact,
        implementationEffort: 'medium',
        status: 'pending' as SuggestionStatus,
        source: 'ai_model',
        confidence: seoSuggestion.confidence,
      });
    }

    return suggestions;
  }

  private async generateRuleBasedSuggestions(
    request: OptimizeContentRequest,
    rules: OptimizationRule[]
  ): Promise<Array<Omit<ContentOptimizationSuggestion, 'id' | 'createdAt' | 'updatedAt'>>> {
    const suggestions = [];

    for (const rule of rules) {
      if (this.evaluateRuleConditions(rule.conditions, request.content)) {
        for (const action of rule.actions) {
          suggestions.push({
            category: rule.category,
            type: action.type,
            priority: rule.priority,
            title: action.title,
            description: action.description,
            suggestion: action.suggestion,
            reasoning: action.reasoning || `Applied rule: ${rule.name}`,
            expectedImpact: action.expectedImpact || {
              metric: 'engagement',
              change: 15,
              confidence: 0.7,
            },
            implementationEffort: action.implementationEffort || 'medium',
            status: 'pending' as SuggestionStatus,
            source: 'optimization_rule',
            confidence: 0.8,
            ruleId: rule.id,
          });
        }
      }
    }

    return suggestions;
  }

  private evaluateRuleConditions(conditions: Record<string, any>, content: Record<string, any>): boolean {
    // Mock rule evaluation - in real implementation, evaluate conditions against content
    return Math.random() > 0.3; // 70% chance rule applies
  }

  private rankSuggestions(
    suggestions: Array<Omit<ContentOptimizationSuggestion, 'id' | 'createdAt' | 'updatedAt'>>,
    optimizationGoals: string[]
  ): Array<Omit<ContentOptimizationSuggestion, 'id' | 'createdAt' | 'updatedAt'>> {
    return suggestions.sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by confidence
      return (b.confidence || 0) - (a.confidence || 0);
    });
  }

  private async saveSuggestions(
    companyId: string,
    entityType: ContentAnalyticsEntityType,
    entityId: string,
    suggestions: Array<Omit<ContentOptimizationSuggestion, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ContentOptimizationSuggestion[]> {
    const savedSuggestions = [];

    for (const suggestionData of suggestions) {
      const suggestion = this.suggestionRepository.create({
        companyId,
        entityType,
        entityId,
        ...suggestionData,
      });

      savedSuggestions.push(await this.suggestionRepository.save(suggestion));
    }

    return savedSuggestions;
  }

  private calculateOptimizationScore(
    content: Record<string, any>,
    suggestions: ContentOptimizationSuggestion[]
  ): number {
    // Base score
    let score = 70;

    // Deduct points for high priority suggestions
    const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high');
    score -= highPrioritySuggestions.length * 8;

    // Deduct points for medium priority suggestions
    const mediumPrioritySuggestions = suggestions.filter(s => s.priority === 'medium');
    score -= mediumPrioritySuggestions.length * 4;

    // Deduct points for low priority suggestions
    const lowPrioritySuggestions = suggestions.filter(s => s.priority === 'low');
    score -= lowPrioritySuggestions.length * 2;

    // Content quality bonuses
    if (content.title && content.title.length > 30 && content.title.length < 60) {
      score += 5; // Good title length
    }

    if (content.body && content.body.length > 300) {
      score += 5; // Sufficient content length
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  private generateOptimizationInsights(
    suggestions: ContentOptimizationSuggestion[],
    performanceData: any,
    optimizationScore: number
  ): string[] {
    const insights = [];

    if (optimizationScore < 60) {
      insights.push('This content has significant optimization opportunities');
    } else if (optimizationScore < 80) {
      insights.push('This content is performing well but has room for improvement');
    } else {
      insights.push('This content is well-optimized');
    }

    const seoSuggestions = suggestions.filter(s => s.category === 'seo');
    if (seoSuggestions.length > 0) {
      insights.push(`${seoSuggestions.length} SEO improvements identified`);
    }

    const readabilitySuggestions = suggestions.filter(s => s.category === 'readability');
    if (readabilitySuggestions.length > 0) {
      insights.push(`${readabilitySuggestions.length} readability enhancements recommended`);
    }

    const engagementSuggestions = suggestions.filter(s => s.category === 'engagement');
    if (engagementSuggestions.length > 0) {
      insights.push(`${engagementSuggestions.length} engagement optimizations available`);
    }

    if (performanceData.currentViews < performanceData.benchmarkViews) {
      const gap = ((performanceData.benchmarkViews - performanceData.currentViews) / performanceData.benchmarkViews * 100).toFixed(0);
      insights.push(`Views are ${gap}% below benchmark - optimization could help bridge this gap`);
    }

    return insights;
  }

  private estimateImpact(
    suggestions: ContentOptimizationSuggestion[],
    performanceData: any
  ): {
    viewsIncrease: number;
    engagementIncrease: number;
    conversionIncrease: number;
  } {
    let viewsIncrease = 0;
    let engagementIncrease = 0;
    let conversionIncrease = 0;

    for (const suggestion of suggestions) {
      if (suggestion.expectedImpact) {
        const impact = suggestion.expectedImpact;
        const confidence = suggestion.confidence || 0.5;

        switch (impact.metric) {
          case 'views':
            viewsIncrease += (performanceData.currentViews * impact.change / 100) * confidence;
            break;
          case 'engagement':
            engagementIncrease += (performanceData.currentEngagement * impact.change / 100) * confidence;
            break;
          case 'conversions':
            conversionIncrease += (performanceData.currentConversions * impact.change / 100) * confidence;
            break;
        }
      }
    }

    return {
      viewsIncrease: Math.floor(viewsIncrease),
      engagementIncrease: Math.floor(engagementIncrease),
      conversionIncrease: Math.floor(conversionIncrease),
    };
  }

  // AI Analysis Methods (Mock implementations)
  private async analyzeTitle(title: string, performanceData: any): Promise<any> {
    if (title.length < 30) {
      return {
        description: 'Title is too short and may not provide enough context',
        suggestion: 'Expand title to 30-60 characters for better SEO and click-through rates',
        reasoning: 'Titles between 30-60 characters perform 23% better in search results',
        expectedImpact: { metric: 'views', change: 20, confidence: 0.8 },
        confidence: 0.85,
      };
    }

    if (title.length > 60) {
      return {
        description: 'Title may be truncated in search results',
        suggestion: 'Shorten title to under 60 characters while maintaining key messaging',
        reasoning: 'Long titles get truncated in search results, reducing click-through rates',
        expectedImpact: { metric: 'views', change: 15, confidence: 0.7 },
        confidence: 0.75,
      };
    }

    return null;
  }

  private async analyzeContentStructure(content: string, performanceData: any): Promise<any> {
    const paragraphs = content.split('\n\n').length;
    const wordCount = content.split(' ').length;

    if (wordCount > 500 && paragraphs < 3) {
      return {
        description: 'Content lacks proper paragraph structure for readability',
        suggestion: 'Break content into smaller paragraphs (3-4 sentences each) and add subheadings',
        reasoning: 'Well-structured content improves readability and keeps readers engaged longer',
        expectedImpact: { metric: 'engagement', change: 18, confidence: 0.75 },
        confidence: 0.8,
      };
    }

    return null;
  }

  private async analyzeSEO(content: Record<string, any>, performanceData: any): Promise<any> {
    const title = content.title || '';
    const body = content.body || content.content || '';
    
    // Mock SEO analysis
    if (!body.toLowerCase().includes(title.toLowerCase().split(' ')[0])) {
      return {
        description: 'Primary keyword from title not found in content body',
        suggestion: 'Include primary keyword from title 2-3 times naturally throughout the content',
        reasoning: 'Keyword consistency between title and content improves SEO rankings',
        expectedImpact: { metric: 'views', change: 25, confidence: 0.8 },
        confidence: 0.85,
      };
    }

    return null;
  }

  private async generateMockSuggestions(
    companyId: string,
    entityType: ContentAnalyticsEntityType,
    entityId: string,
    count: number
  ): Promise<ContentOptimizationSuggestion[]> {
    const mockSuggestions = [
      {
        category: 'seo' as OptimizationCategory,
        type: 'title_optimization',
        priority: 'high' as OptimizationPriority,
        title: 'Optimize Title Length',
        description: 'Title is outside optimal length range',
        suggestion: 'Adjust title to 30-60 characters for better SEO',
        reasoning: 'Optimal title length improves click-through rates',
        expectedImpact: { metric: 'views', change: 20, confidence: 0.8 },
        implementationEffort: 'low',
        confidence: 0.85,
      },
      {
        category: 'readability' as OptimizationCategory,
        type: 'structure_optimization',
        priority: 'medium' as OptimizationPriority,
        title: 'Improve Content Structure',
        description: 'Content lacks proper paragraph breaks',
        suggestion: 'Add subheadings and break long paragraphs',
        reasoning: 'Better structure improves readability and engagement',
        expectedImpact: { metric: 'engagement', change: 15, confidence: 0.7 },
        implementationEffort: 'medium',
        confidence: 0.75,
      },
      {
        category: 'engagement' as OptimizationCategory,
        type: 'cta_optimization',
        priority: 'high' as OptimizationPriority,
        title: 'Add Call-to-Action',
        description: 'Content lacks clear call-to-action',
        suggestion: 'Add compelling CTA at end of content',
        reasoning: 'Clear CTAs increase conversion rates',
        expectedImpact: { metric: 'conversions', change: 30, confidence: 0.85 },
        implementationEffort: 'low',
        confidence: 0.9,
      },
    ];

    return mockSuggestions.slice(0, count).map(suggestion => {
      const entity = this.suggestionRepository.create({
        companyId,
        entityType,
        entityId,
        status: 'pending' as SuggestionStatus,
        source: 'ai_model',
        ...suggestion,
      });
      
      // Mock ID and timestamps
      entity.id = `suggestion_${Math.random().toString(36).substr(2, 9)}`;
      entity.createdAt = new Date();
      entity.updatedAt = new Date();
      
      return entity;
    });
  }
}