import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentSafetyCheck } from '../../database/entities/content-safety-check.entity';
import { ContentModerationRule } from '../../database/entities/content-moderation-rule.entity';
import { SecurityMonitoringService } from './security-monitoring.service';
import { 
  ContentModerationRequest,
  ContentModerationResponse,
  CreateModerationRuleRequest,
  ModerationAction,
  ModerationSeverity,
  ContentRiskLevel,
  ContentAnalyticsEntityType,
  BulkModerationRequest,
  ModerationRuleType
} from '@internal-marketing-content-app/shared';

@Injectable()
export class ContentModerationService {
  constructor(
    @InjectRepository(ContentSafetyCheck)
    private safetyCheckRepository: Repository<ContentSafetyCheck>,
    
    @InjectRepository(ContentModerationRule)
    private moderationRuleRepository: Repository<ContentModerationRule>,
    
    private securityMonitoringService: SecurityMonitoringService,
  ) {}

  async moderateContent(request: ContentModerationRequest): Promise<ContentModerationResponse> {
    // Run safety checks
    const safetyCheck = await this.runSafetyChecks(request);
    
    // Get applicable moderation rules
    const rules = await this.getApplicableRules(request.companyId, request.entityType);
    
    // Apply rules to content
    const ruleResults = await this.applyModerationRules(request, rules);
    
    // Combine results and determine final action
    const finalResult = this.combineModerationResults(safetyCheck, ruleResults);
    
    // Execute moderation actions if necessary
    if (finalResult.action !== 'approve') {
      await this.executeModerationAction(request, finalResult);
    }
    
    // Log security event if flagged
    if (finalResult.riskLevel === 'high' || finalResult.riskLevel === 'critical') {
      await this.securityMonitoringService.logSecurityEvent(
        request.companyId,
        'content_violation',
        finalResult.riskLevel === 'critical' ? 'critical' : 'high',
        {
          entityType: request.entityType,
          entityId: request.entityId,
          description: `Content moderation flagged: ${finalResult.reason}`,
          metadata: { moderationResult: finalResult },
        }
      );
    }
    
    return {
      entityId: request.entityId,
      entityType: request.entityType,
      action: finalResult.action,
      riskLevel: finalResult.riskLevel,
      confidence: finalResult.confidence,
      reason: finalResult.reason,
      flaggedCategories: finalResult.flaggedCategories,
      safetyScores: safetyCheck.scores,
      appliedRules: ruleResults.map(r => r.ruleName),
      recommendations: this.generateModerationRecommendations(finalResult),
      reviewRequired: finalResult.action === 'flag_for_review',
    };
  }

  async bulkModerateContent(request: BulkModerationRequest): Promise<{
    results: ContentModerationResponse[];
    summary: {
      total: number;
      approved: number;
      flagged: number;
      blocked: number;
      reviewRequired: number;
    };
  }> {
    const results = [];
    
    for (const contentItem of request.contentItems) {
      const moderationRequest: ContentModerationRequest = {
        companyId: request.companyId,
        entityType: contentItem.entityType,
        entityId: contentItem.entityId,
        content: contentItem.content,
        metadata: contentItem.metadata,
        options: request.options,
      };
      
      const result = await this.moderateContent(moderationRequest);
      results.push(result);
    }
    
    const summary = {
      total: results.length,
      approved: results.filter(r => r.action === 'approve').length,
      flagged: results.filter(r => r.action === 'flag_for_review').length,
      blocked: results.filter(r => r.action === 'block').length,
      reviewRequired: results.filter(r => r.reviewRequired).length,
    };
    
    return { results, summary };
  }

  async createModerationRule(request: CreateModerationRuleRequest): Promise<ContentModerationRule> {
    const rule = this.moderationRuleRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      name: request.name,
      description: request.description,
      ruleType: request.ruleType,
      conditions: request.conditions,
      action: request.action,
      severity: request.severity,
      applicableEntityTypes: request.applicableEntityTypes,
      isEnabled: true,
      triggerCount: 0,
    });

    return this.moderationRuleRepository.save(rule);
  }

  async getModerationRules(companyId: string): Promise<ContentModerationRule[]> {
    return this.moderationRuleRepository.find({
      where: { companyId, isEnabled: true },
      order: { createdAt: 'DESC' },
    });
  }

  async updateModerationRule(
    id: string,
    companyId: string,
    updates: Partial<ContentModerationRule>
  ): Promise<ContentModerationRule> {
    const rule = await this.moderationRuleRepository.findOne({
      where: { id, companyId },
    });

    if (!rule) {
      throw new Error('Moderation rule not found');
    }

    Object.assign(rule, updates);
    return this.moderationRuleRepository.save(rule);
  }

  async getSafetyChecks(
    companyId: string,
    entityId?: string,
    riskLevel?: ContentRiskLevel
  ): Promise<ContentSafetyCheck[]> {
    const query = this.safetyCheckRepository
      .createQueryBuilder('check')
      .where('check.companyId = :companyId', { companyId })
      .orderBy('check.checkedAt', 'DESC');

    if (entityId) {
      query.andWhere('check.entityId = :entityId', { entityId });
    }

    if (riskLevel) {
      query.andWhere('check.riskLevel = :riskLevel', { riskLevel });
    }

    return query.getMany();
  }

  async getModerationDashboard(companyId: string): Promise<{
    summary: {
      totalChecks: number;
      flaggedContent: number;
      blockedContent: number;
      averageRiskScore: number;
      activeRules: number;
    };
    recentChecks: ContentSafetyCheck[];
    riskDistribution: Record<ContentRiskLevel, number>;
    topViolations: Array<{ category: string; count: number }>;
    moderationTrends: Array<{ date: string; flagged: number; blocked: number }>;
  }> {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [
      recentChecks,
      activeRules,
      allChecks,
    ] = await Promise.all([
      this.getSafetyChecks(companyId),
      this.moderationRuleRepository.count({ where: { companyId, isEnabled: true } }),
      this.safetyCheckRepository.find({
        where: { companyId },
        order: { checkedAt: 'DESC' },
        take: 1000,
      }),
    ]);

    const flaggedContent = allChecks.filter(c => c.action === 'flag_for_review').length;
    const blockedContent = allChecks.filter(c => c.action === 'block').length;
    const averageRiskScore = allChecks.length > 0 
      ? allChecks.reduce((sum, c) => sum + (c.riskScore || 0), 0) / allChecks.length 
      : 0;

    const riskDistribution = {
      low: allChecks.filter(c => c.riskLevel === 'low').length,
      medium: allChecks.filter(c => c.riskLevel === 'medium').length,
      high: allChecks.filter(c => c.riskLevel === 'high').length,
      critical: allChecks.filter(c => c.riskLevel === 'critical').length,
    };

    const topViolations = this.calculateTopViolations(allChecks);
    const moderationTrends = this.calculateModerationTrends(allChecks, 7); // Last 7 days

    return {
      summary: {
        totalChecks: allChecks.length,
        flaggedContent,
        blockedContent,
        averageRiskScore: parseFloat(averageRiskScore.toFixed(2)),
        activeRules,
      },
      recentChecks: recentChecks.slice(0, 10),
      riskDistribution,
      topViolations,
      moderationTrends,
    };
  }

  private async runSafetyChecks(request: ContentModerationRequest): Promise<ContentSafetyCheck> {
    const scores = await this.analyzeSafetyScores(request.content);
    const riskLevel = this.calculateRiskLevel(scores);
    const action = this.determineActionFromScores(scores, riskLevel);
    
    const safetyCheck = this.safetyCheckRepository.create({
      companyId: request.companyId,
      entityType: request.entityType,
      entityId: request.entityId,
      checkType: 'automated',
      scores,
      riskLevel,
      riskScore: this.calculateOverallRiskScore(scores),
      flaggedCategories: this.identifyFlaggedCategories(scores),
      action,
      confidence: this.calculateConfidence(scores),
      checkedAt: new Date(),
      metadata: request.metadata || {},
    });

    return this.safetyCheckRepository.save(safetyCheck);
  }

  private async analyzeSafetyScores(content: Record<string, any>): Promise<Record<string, number>> {
    // Mock AI-powered content analysis - in real implementation, integrate with safety APIs
    const text = this.extractTextFromContent(content);
    
    return {
      toxicity: this.mockAnalyzeText(text, 'toxicity'),
      profanity: this.mockAnalyzeText(text, 'profanity'),
      harassment: this.mockAnalyzeText(text, 'harassment'),
      hateSpeech: this.mockAnalyzeText(text, 'hateSpeech'),
      violence: this.mockAnalyzeText(text, 'violence'),
      sexualContent: this.mockAnalyzeText(text, 'sexualContent'),
      spam: this.mockAnalyzeText(text, 'spam'),
      privacy: this.mockAnalyzePrivacyViolation(text),
      copyright: this.mockAnalyzeCopyright(text),
      misinformation: this.mockAnalyzeMisinformation(text),
    };
  }

  private extractTextFromContent(content: Record<string, any>): string {
    const textFields = ['title', 'body', 'content', 'description', 'summary'];
    let extractedText = '';
    
    for (const field of textFields) {
      if (content[field] && typeof content[field] === 'string') {
        extractedText += content[field] + ' ';
      }
    }
    
    return extractedText.trim();
  }

  private mockAnalyzeText(text: string, category: string): number {
    // Mock analysis based on text characteristics
    const lowerText = text.toLowerCase();
    
    switch (category) {
      case 'toxicity':
        return lowerText.includes('hate') || lowerText.includes('awful') ? 0.8 : Math.random() * 0.3;
      case 'profanity':
        return lowerText.includes('damn') || lowerText.includes('hell') ? 0.6 : Math.random() * 0.2;
      case 'harassment':
        return lowerText.includes('attack') || lowerText.includes('target') ? 0.7 : Math.random() * 0.25;
      case 'hateSpeech':
        return lowerText.includes('discriminat') || lowerText.includes('racist') ? 0.9 : Math.random() * 0.2;
      case 'violence':
        return lowerText.includes('kill') || lowerText.includes('violence') ? 0.8 : Math.random() * 0.15;
      case 'sexualContent':
        return lowerText.includes('sexual') || lowerText.includes('explicit') ? 0.7 : Math.random() * 0.1;
      case 'spam':
        return text.includes('!!!') || text.includes('URGENT') ? 0.6 : Math.random() * 0.3;
      default:
        return Math.random() * 0.3;
    }
  }

  private mockAnalyzePrivacyViolation(text: string): number {
    // Check for potential PII exposure
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /\b\d{3}-\d{3}-\d{4}\b/g;
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
    
    let score = 0;
    if (emailRegex.test(text)) score += 0.3;
    if (phoneRegex.test(text)) score += 0.4;
    if (ssnRegex.test(text)) score += 0.8;
    
    return Math.min(score, 1.0);
  }

  private mockAnalyzeCopyright(text: string): number {
    // Mock copyright violation detection
    if (text.includes('©') || text.includes('copyright') || text.includes('all rights reserved')) {
      return Math.random() * 0.4 + 0.1;
    }
    return Math.random() * 0.2;
  }

  private mockAnalyzeMisinformation(text: string): number {
    // Mock misinformation detection
    const misinfoKeywords = ['fake news', 'conspiracy', 'hoax', 'false claim'];
    const lowerText = text.toLowerCase();
    
    for (const keyword of misinfoKeywords) {
      if (lowerText.includes(keyword)) {
        return Math.random() * 0.3 + 0.5;
      }
    }
    
    return Math.random() * 0.3;
  }

  private calculateRiskLevel(scores: Record<string, number>): ContentRiskLevel {
    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore >= 0.8) return 'critical';
    if (maxScore >= 0.6) return 'high';
    if (maxScore >= 0.4) return 'medium';
    return 'low';
  }

  private calculateOverallRiskScore(scores: Record<string, number>): number {
    const values = Object.values(scores);
    const average = values.reduce((sum, score) => sum + score, 0) / values.length;
    const maxScore = Math.max(...values);
    
    // Weighted combination of average and max score
    return (average * 0.3 + maxScore * 0.7) * 100;
  }

  private identifyFlaggedCategories(scores: Record<string, number>): string[] {
    const threshold = 0.5;
    return Object.entries(scores)
      .filter(([_, score]) => score >= threshold)
      .map(([category, _]) => category);
  }

  private determineActionFromScores(scores: Record<string, number>, riskLevel: ContentRiskLevel): ModerationAction {
    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore >= 0.9 || riskLevel === 'critical') return 'block';
    if (maxScore >= 0.6 || riskLevel === 'high') return 'flag_for_review';
    if (maxScore >= 0.4 || riskLevel === 'medium') return 'warn';
    return 'approve';
  }

  private calculateConfidence(scores: Record<string, number>): number {
    // Higher confidence when scores are more definitive (closer to 0 or 1)
    const values = Object.values(scores);
    const avgDistanceFromCenter = values.reduce((sum, score) => sum + Math.abs(score - 0.5), 0) / values.length;
    return Math.min(avgDistanceFromCenter * 2, 1.0);
  }

  private async getApplicableRules(
    companyId: string,
    entityType: ContentAnalyticsEntityType
  ): Promise<ContentModerationRule[]> {
    return this.moderationRuleRepository
      .createQueryBuilder('rule')
      .where('rule.companyId = :companyId', { companyId })
      .andWhere('rule.isEnabled = :isEnabled', { isEnabled: true })
      .andWhere(':entityType = ANY(rule.applicableEntityTypes)', { entityType })
      .orderBy('rule.severity', 'DESC') // Apply most severe rules first
      .getMany();
  }

  private async applyModerationRules(
    request: ContentModerationRequest,
    rules: ContentModerationRule[]
  ): Promise<Array<{
    ruleId: string;
    ruleName: string;
    matched: boolean;
    action: ModerationAction;
    severity: ModerationSeverity;
    reason: string;
  }>> {
    const results = [];
    
    for (const rule of rules) {
      const matched = this.evaluateRuleConditions(rule.conditions, request.content);
      
      if (matched) {
        // Increment rule trigger count
        rule.triggerCount += 1;
        rule.lastTriggeredAt = new Date();
        await this.moderationRuleRepository.save(rule);
      }
      
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        matched,
        action: rule.action,
        severity: rule.severity,
        reason: matched ? `Rule "${rule.name}" triggered` : '',
      });
    }
    
    return results;
  }

  private evaluateRuleConditions(conditions: Record<string, any>, content: Record<string, any>): boolean {
    // Mock rule evaluation - in real implementation, evaluate complex conditions
    const text = this.extractTextFromContent(content);
    
    if (conditions.keywords) {
      const lowerText = text.toLowerCase();
      return conditions.keywords.some((keyword: string) => lowerText.includes(keyword.toLowerCase()));
    }
    
    if (conditions.minLength && text.length < conditions.minLength) {
      return true;
    }
    
    if (conditions.maxLength && text.length > conditions.maxLength) {
      return true;
    }
    
    if (conditions.patterns) {
      return conditions.patterns.some((pattern: string) => {
        try {
          const regex = new RegExp(pattern, 'i');
          return regex.test(text);
        } catch {
          return false;
        }
      });
    }
    
    return false;
  }

  private combineModerationResults(
    safetyCheck: ContentSafetyCheck,
    ruleResults: Array<{
      matched: boolean;
      action: ModerationAction;
      severity: ModerationSeverity;
      reason: string;
    }>
  ): {
    action: ModerationAction;
    riskLevel: ContentRiskLevel;
    confidence: number;
    reason: string;
    flaggedCategories: string[];
  } {
    // Get matched rules and their most severe action
    const matchedRules = ruleResults.filter(r => r.matched);
    const mostSevereRuleAction = this.getMostSevereAction([
      safetyCheck.action,
      ...matchedRules.map(r => r.action),
    ]);
    
    const reasons = [
      safetyCheck.flaggedCategories.length > 0 ? `Safety concerns: ${safetyCheck.flaggedCategories.join(', ')}` : '',
      ...matchedRules.map(r => r.reason),
    ].filter(r => r);
    
    return {
      action: mostSevereRuleAction,
      riskLevel: safetyCheck.riskLevel,
      confidence: safetyCheck.confidence,
      reason: reasons.join('; '),
      flaggedCategories: safetyCheck.flaggedCategories,
    };
  }

  private getMostSevereAction(actions: ModerationAction[]): ModerationAction {
    const severityOrder: Record<ModerationAction, number> = {
      block: 4,
      flag_for_review: 3,
      warn: 2,
      approve: 1,
    };
    
    return actions.reduce((mostSevere, current) => {
      return severityOrder[current] > severityOrder[mostSevere] ? current : mostSevere;
    }, 'approve');
  }

  private async executeModerationAction(
    request: ContentModerationRequest,
    result: { action: ModerationAction; reason: string }
  ): Promise<void> {
    switch (result.action) {
      case 'block':
        await this.blockContent(request.entityType, request.entityId, result.reason);
        break;
        
      case 'flag_for_review':
        await this.flagForReview(request.entityType, request.entityId, result.reason);
        break;
        
      case 'warn':
        await this.warnContent(request.entityType, request.entityId, result.reason);
        break;
        
      // 'approve' requires no action
    }
  }

  private async blockContent(entityType: string, entityId: string, reason: string): Promise<void> {
    // Mock content blocking - in real implementation, update content status
    console.log(`Blocking ${entityType} ${entityId}: ${reason}`);
    
    // Would typically:
    // - Set content status to 'blocked'
    // - Remove from public visibility
    // - Notify content creator
    // - Log the action
  }

  private async flagForReview(entityType: string, entityId: string, reason: string): Promise<void> {
    // Mock flagging for review - in real implementation, create review task
    console.log(`Flagging ${entityType} ${entityId} for review: ${reason}`);
    
    // Would typically:
    // - Create moderation review task
    // - Assign to human moderator
    // - Set content to pending review status
    // - Send notification to moderation team
  }

  private async warnContent(entityType: string, entityId: string, reason: string): Promise<void> {
    // Mock warning - in real implementation, add warning label
    console.log(`Warning ${entityType} ${entityId}: ${reason}`);
    
    // Would typically:
    // - Add warning label to content
    // - Notify content creator
    // - Track warning count
    // - Apply visibility restrictions
  }

  private generateModerationRecommendations(result: {
    action: ModerationAction;
    riskLevel: ContentRiskLevel;
    flaggedCategories: string[];
  }): string[] {
    const recommendations = [];
    
    if (result.action === 'block') {
      recommendations.push('Content has been blocked due to policy violations');
      recommendations.push('Review and edit content before resubmitting');
    }
    
    if (result.action === 'flag_for_review') {
      recommendations.push('Content requires human review before publication');
      recommendations.push('Consider revising flagged sections while awaiting review');
    }
    
    if (result.flaggedCategories.includes('toxicity')) {
      recommendations.push('Remove or rephrase toxic language to improve content quality');
    }
    
    if (result.flaggedCategories.includes('privacy')) {
      recommendations.push('Remove or redact personal information to protect privacy');
    }
    
    if (result.flaggedCategories.includes('spam')) {
      recommendations.push('Reduce promotional language and excessive capitalization');
    }
    
    if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
      recommendations.push('Consider significant content revision due to high risk level');
    }
    
    return recommendations;
  }

  private calculateTopViolations(checks: ContentSafetyCheck[]): Array<{ category: string; count: number }> {
    const violations: Record<string, number> = {};
    
    for (const check of checks) {
      for (const category of check.flaggedCategories) {
        violations[category] = (violations[category] || 0) + 1;
      }
    }
    
    return Object.entries(violations)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateModerationTrends(
    checks: ContentSafetyCheck[],
    days: number
  ): Array<{ date: string; flagged: number; blocked: number }> {
    const trends = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayChecks = checks.filter(c => 
        c.checkedAt.toISOString().split('T')[0] === dateStr
      );
      
      trends.unshift({
        date: dateStr,
        flagged: dayChecks.filter(c => c.action === 'flag_for_review').length,
        blocked: dayChecks.filter(c => c.action === 'block').length,
      });
    }
    
    return trends;
  }
}