import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ABTest } from '../../database/entities/ab-test.entity';
import { ABTestVariant } from '../../database/entities/ab-test-variant.entity';
import { ContentMetricsService } from './content-metrics.service';
import { 
  CreateABTestRequest,
  UpdateABTestRequest,
  ABTestStatus,
  ABTestResults,
  ABTestVariantResults,
  ABTestAllocationMethod,
  ContentAnalyticsEntityType
} from '@internal-marketing-content-app/shared';

@Injectable()
export class ABTestService {
  constructor(
    @InjectRepository(ABTest)
    private abTestRepository: Repository<ABTest>,
    
    @InjectRepository(ABTestVariant)
    private variantRepository: Repository<ABTestVariant>,
    
    private contentMetricsService: ContentMetricsService,
  ) {}

  async createABTest(request: CreateABTestRequest): Promise<ABTest> {
    // Validate variants
    if (!request.variants || request.variants.length < 2) {
      throw new Error('A/B test must have at least 2 variants');
    }

    const totalTrafficAllocation = request.variants.reduce((sum, v) => sum + v.trafficAllocation, 0);
    if (Math.abs(totalTrafficAllocation - 100) > 0.01) {
      throw new Error('Total traffic allocation must equal 100%');
    }

    // Create test
    const abTest = this.abTestRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      name: request.name,
      description: request.description,
      hypothesis: request.hypothesis,
      entityType: request.entityType,
      entityId: request.entityId,
      status: 'draft',
      allocationMethod: request.allocationMethod || 'random',
      startDate: request.startDate,
      endDate: request.endDate,
      targetSampleSize: request.targetSampleSize,
      significanceLevel: request.significanceLevel || 0.05,
      minimumDetectableEffect: request.minimumDetectableEffect || 0.05,
      primaryMetric: request.primaryMetric,
      secondaryMetrics: request.secondaryMetrics || [],
      segmentationRules: request.segmentationRules || {},
      exclusionRules: request.exclusionRules || {},
    });

    const savedTest = await this.abTestRepository.save(abTest);

    // Create variants
    const variants = [];
    for (const variantData of request.variants) {
      const variant = this.variantRepository.create({
        testId: savedTest.id,
        name: variantData.name,
        description: variantData.description,
        configuration: variantData.configuration,
        trafficAllocation: variantData.trafficAllocation,
        isControl: variantData.isControl || false,
      });
      variants.push(await this.variantRepository.save(variant));
    }

    return {
      ...savedTest,
      variants,
    };
  }

  async getABTests(companyId: string, status?: ABTestStatus): Promise<ABTest[]> {
    const query = this.abTestRepository
      .createQueryBuilder('test')
      .leftJoinAndSelect('test.variants', 'variants')
      .where('test.companyId = :companyId', { companyId })
      .orderBy('test.createdAt', 'DESC');

    if (status) {
      query.andWhere('test.status = :status', { status });
    }

    return query.getMany();
  }

  async getABTest(id: string, companyId: string): Promise<ABTest> {
    const test = await this.abTestRepository
      .createQueryBuilder('test')
      .leftJoinAndSelect('test.variants', 'variants')
      .where('test.id = :id', { id })
      .andWhere('test.companyId = :companyId', { companyId })
      .getOne();

    if (!test) {
      throw new Error('A/B test not found');
    }

    return test;
  }

  async updateABTest(
    id: string, 
    companyId: string, 
    request: UpdateABTestRequest
  ): Promise<ABTest> {
    const test = await this.getABTest(id, companyId);

    if (test.status === 'running') {
      // Only allow limited updates when test is running
      const allowedFields = ['endDate', 'targetSampleSize'];
      const updates = Object.keys(request).filter(key => allowedFields.includes(key));
      
      if (updates.length === 0) {
        throw new Error('Cannot modify running A/B test except for end date and sample size');
      }
    }

    Object.assign(test, request);
    return this.abTestRepository.save(test);
  }

  async startABTest(id: string, companyId: string): Promise<ABTest> {
    const test = await this.getABTest(id, companyId);

    if (test.status !== 'draft') {
      throw new Error(`Cannot start A/B test in ${test.status} status`);
    }

    // Validate test configuration
    await this.validateTestConfiguration(test);

    test.status = 'running';
    test.actualStartDate = new Date();

    return this.abTestRepository.save(test);
  }

  async stopABTest(id: string, companyId: string): Promise<ABTest> {
    const test = await this.getABTest(id, companyId);

    if (test.status !== 'running') {
      throw new Error(`Cannot stop A/B test in ${test.status} status`);
    }

    test.status = 'completed';
    test.actualEndDate = new Date();

    return this.abTestRepository.save(test);
  }

  async getABTestResults(id: string, companyId: string): Promise<ABTestResults> {
    const test = await this.getABTest(id, companyId);

    if (test.status === 'draft') {
      throw new Error('Cannot get results for draft A/B test');
    }

    const startDate = test.actualStartDate || test.startDate;
    const endDate = test.actualEndDate || new Date();

    // Get results for each variant
    const variantResults: ABTestVariantResults[] = [];
    
    for (const variant of test.variants) {
      const metrics = await this.getVariantMetrics(
        test.entityType,
        test.entityId,
        variant.id,
        startDate,
        endDate,
        [test.primaryMetric, ...test.secondaryMetrics]
      );

      variantResults.push({
        variantId: variant.id,
        variantName: variant.name,
        isControl: variant.isControl,
        participants: metrics.participants,
        conversions: metrics.conversions,
        conversionRate: metrics.conversionRate,
        primaryMetricValue: metrics.primaryMetricValue,
        secondaryMetrics: metrics.secondaryMetrics,
        confidence: this.calculateConfidence(variant, test.variants, metrics),
        statisticalSignificance: this.calculateStatisticalSignificance(
          variant, 
          test.variants, 
          metrics, 
          test.significanceLevel
        ),
      });
    }

    // Calculate overall results
    const winner = this.determineWinner(variantResults, test.significanceLevel);
    const totalParticipants = variantResults.reduce((sum, v) => sum + v.participants, 0);
    
    return {
      testId: id,
      status: test.status,
      startDate,
      endDate,
      duration: this.calculateDuration(startDate, endDate),
      totalParticipants,
      variants: variantResults,
      winner: winner ? {
        variantId: winner.variantId,
        variantName: winner.variantName,
        improvement: winner.improvement,
        confidence: winner.confidence,
      } : null,
      insights: this.generateInsights(test, variantResults),
      recommendations: this.generateRecommendations(test, variantResults),
    };
  }

  async assignVariant(
    testId: string,
    userId: string,
    visitorId: string,
    segmentData?: Record<string, any>
  ): Promise<{ variantId: string; variantName: string }> {
    const test = await this.abTestRepository
      .createQueryBuilder('test')
      .leftJoinAndSelect('test.variants', 'variants')
      .where('test.id = :testId', { testId })
      .andWhere('test.status = :status', { status: 'running' })
      .getOne();

    if (!test) {
      throw new Error('Active A/B test not found');
    }

    // Check exclusion rules
    if (this.checkExclusionRules(test.exclusionRules, { userId, segmentData })) {
      // Return control variant for excluded users
      const controlVariant = test.variants.find(v => v.isControl) || test.variants[0];
      return {
        variantId: controlVariant.id,
        variantName: controlVariant.name,
      };
    }

    // Assign variant based on allocation method
    const variant = this.allocateVariant(test, visitorId, segmentData);
    
    return {
      variantId: variant.id,
      variantName: variant.name,
    };
  }

  private async validateTestConfiguration(test: ABTest): Promise<void> {
    // Check if entity exists and is accessible
    // This would typically check if the content exists and user has permissions
    
    // Check if dates are valid
    if (test.endDate <= test.startDate) {
      throw new Error('End date must be after start date');
    }

    // Check if variants are properly configured
    if (!test.variants || test.variants.length < 2) {
      throw new Error('Test must have at least 2 variants');
    }

    const totalAllocation = test.variants.reduce((sum, v) => sum + v.trafficAllocation, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      throw new Error('Total traffic allocation must equal 100%');
    }
  }

  private async getVariantMetrics(
    entityType: ContentAnalyticsEntityType,
    entityId: string,
    variantId: string,
    startDate: Date,
    endDate: Date,
    metricTypes: string[]
  ): Promise<{
    participants: number;
    conversions: number;
    conversionRate: number;
    primaryMetricValue: number;
    secondaryMetrics: Record<string, number>;
  }> {
    // Mock implementation - in real implementation, query metrics filtered by variant
    const participants = Math.floor(Math.random() * 1000) + 100;
    const conversions = Math.floor(Math.random() * 50) + 10;
    const conversionRate = (conversions / participants) * 100;
    const primaryMetricValue = Math.floor(Math.random() * 1000) + 500;
    
    const secondaryMetrics: Record<string, number> = {};
    for (const metric of metricTypes.slice(1)) {
      secondaryMetrics[metric] = Math.floor(Math.random() * 100) + 50;
    }

    return {
      participants,
      conversions,
      conversionRate,
      primaryMetricValue,
      secondaryMetrics,
    };
  }

  private calculateConfidence(
    variant: ABTestVariant,
    allVariants: ABTestVariant[],
    metrics: any
  ): number {
    // Mock confidence calculation - in real implementation, use proper statistical methods
    return Math.random() * 40 + 60; // Random between 60-100%
  }

  private calculateStatisticalSignificance(
    variant: ABTestVariant,
    allVariants: ABTestVariant[],
    metrics: any,
    significanceLevel: number
  ): boolean {
    // Mock significance calculation - in real implementation, use proper statistical tests
    return Math.random() > 0.5;
  }

  private determineWinner(
    variants: ABTestVariantResults[],
    significanceLevel: number
  ): { variantId: string; variantName: string; improvement: number; confidence: number } | null {
    const control = variants.find(v => v.isControl);
    if (!control) return null;

    // Find variant with highest conversion rate that's statistically significant
    const significantVariants = variants.filter(v => 
      !v.isControl && 
      v.statisticalSignificance && 
      v.conversionRate > control.conversionRate
    );

    if (significantVariants.length === 0) return null;

    const winner = significantVariants.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    );

    const improvement = ((winner.conversionRate - control.conversionRate) / control.conversionRate) * 100;

    return {
      variantId: winner.variantId,
      variantName: winner.variantName,
      improvement,
      confidence: winner.confidence,
    };
  }

  private generateInsights(test: ABTest, variants: ABTestVariantResults[]): string[] {
    const insights: string[] = [];
    
    const control = variants.find(v => v.isControl);
    if (control) {
      const bestVariant = variants.reduce((best, current) => 
        current.conversionRate > best.conversionRate ? current : best
      );

      if (bestVariant.variantId !== control.variantId) {
        const improvement = ((bestVariant.conversionRate - control.conversionRate) / control.conversionRate) * 100;
        insights.push(`Best performing variant improved conversion rate by ${improvement.toFixed(1)}%`);
      }

      const totalParticipants = variants.reduce((sum, v) => sum + v.participants, 0);
      insights.push(`Test reached ${totalParticipants} participants across ${variants.length} variants`);

      const significantVariants = variants.filter(v => v.statisticalSignificance);
      if (significantVariants.length > 0) {
        insights.push(`${significantVariants.length} variants showed statistically significant results`);
      }
    }

    return insights;
  }

  private generateRecommendations(test: ABTest, variants: ABTestVariantResults[]): string[] {
    const recommendations: string[] = [];
    
    const winner = variants.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    );

    if (winner.statisticalSignificance) {
      recommendations.push(`Implement ${winner.variantName} as it shows the highest conversion rate with statistical significance`);
    } else {
      const control = variants.find(v => v.isControl);
      if (control) {
        recommendations.push(`Continue with control variant as no significant improvement was detected`);
      }
    }

    if (test.status === 'running') {
      const totalParticipants = variants.reduce((sum, v) => sum + v.participants, 0);
      if (totalParticipants < test.targetSampleSize) {
        const remaining = test.targetSampleSize - totalParticipants;
        recommendations.push(`Continue test to reach target sample size (${remaining} more participants needed)`);
      }
    }

    return recommendations;
  }

  private allocateVariant(
    test: ABTest,
    visitorId: string,
    segmentData?: Record<string, any>
  ): ABTestVariant {
    if (test.allocationMethod === 'segment_based' && segmentData) {
      // Implement segment-based allocation
      return this.allocateBySegment(test.variants, segmentData);
    } else {
      // Random allocation based on traffic allocation
      return this.allocateRandomly(test.variants, visitorId);
    }
  }

  private allocateBySegment(variants: ABTestVariant[], segmentData: Record<string, any>): ABTestVariant {
    // Mock segment-based allocation - in real implementation, use segmentation rules
    return variants[Math.floor(Math.random() * variants.length)];
  }

  private allocateRandomly(variants: ABTestVariant[], visitorId: string): ABTestVariant {
    // Use visitor ID hash for consistent allocation
    const hash = this.hashString(visitorId);
    const random = (hash % 10000) / 100; // 0-100

    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.trafficAllocation;
      if (random <= cumulative) {
        return variant;
      }
    }

    // Fallback to first variant
    return variants[0];
  }

  private checkExclusionRules(exclusionRules: Record<string, any>, context: Record<string, any>): boolean {
    // Mock exclusion rule checking - in real implementation, evaluate rules
    return false;
  }

  private calculateDuration(startDate: Date, endDate: Date): number {
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}