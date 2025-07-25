import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ContentMetric } from '../../database/entities/content-metric.entity';
import { ConversionTracking } from '../../database/entities/conversion-tracking.entity';
import { 
  MetricType, 
  ContentAnalyticsEntityType,
  ContentMetricsRequest,
  ContentMetricsResponse,
  MetricAggregation,
  TrackContentMetricRequest
} from '@internal-marketing-content-app/shared';

@Injectable()
export class ContentMetricsService {
  constructor(
    @InjectRepository(ContentMetric)
    private contentMetricRepository: Repository<ContentMetric>,
    
    @InjectRepository(ConversionTracking)
    private conversionTrackingRepository: Repository<ConversionTracking>,
  ) {}

  async trackMetric(request: TrackContentMetricRequest): Promise<ContentMetric> {
    const metric = this.contentMetricRepository.create({
      entityType: request.entityType,
      entityId: request.entityId,
      entityTitle: request.entityTitle || '',
      companyId: request.companyId,
      metricType: request.metricType,
      value: request.value,
      platform: request.platform,
      userId: request.userId,
      sessionId: request.sessionId,
      visitorId: request.visitorId,
      userAgent: request.userAgent,
      ipAddress: request.ipAddress,
      referrer: request.referrer,
      utmParameters: request.utmParameters,
      eventProperties: request.eventProperties || {},
      recordedAt: request.recordedAt || new Date(),
    });

    return this.contentMetricRepository.save(metric);
  }

  async getContentMetrics(request: ContentMetricsRequest): Promise<ContentMetricsResponse> {
    const { companyId, entityTypes, entityIds, metricTypes, dateRange, groupBy, aggregation } = request;

    // Build base query
    const queryBuilder = this.contentMetricRepository
      .createQueryBuilder('metric')
      .where('metric.companyId = :companyId', { companyId });

    // Apply filters
    if (entityTypes?.length) {
      queryBuilder.andWhere('metric.entityType IN (:...entityTypes)', { entityTypes });
    }

    if (entityIds?.length) {
      queryBuilder.andWhere('metric.entityId IN (:...entityIds)', { entityIds });
    }

    if (metricTypes?.length) {
      queryBuilder.andWhere('metric.metricType IN (:...metricTypes)', { metricTypes });
    }

    if (dateRange) {
      queryBuilder.andWhere('metric.recordedAt BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    // Group and aggregate
    const aggregateFunc = this.getAggregateFunction(aggregation);
    
    if (groupBy?.includes('date')) {
      queryBuilder.addSelect('DATE(metric.recordedAt)', 'date');
      queryBuilder.addGroupBy('DATE(metric.recordedAt)');
    }

    if (groupBy?.includes('entityType')) {
      queryBuilder.addGroupBy('metric.entityType');
    }

    if (groupBy?.includes('metricType')) {
      queryBuilder.addGroupBy('metric.metricType');
    }

    if (groupBy?.includes('platform')) {
      queryBuilder.addGroupBy('metric.platform');
    }

    queryBuilder.addSelect(`${aggregateFunc}(metric.value)`, 'aggregatedValue');
    queryBuilder.orderBy('metric.recordedAt', 'DESC');

    const results = await queryBuilder.getRawMany();

    // Calculate insights
    const insights = await this.calculateInsights(companyId, request);

    return {
      metrics: results,
      insights,
      summary: {
        totalMetrics: results.length,
        dateRange: dateRange || { start: new Date(), end: new Date() },
        topPerformers: await this.getTopPerformers(companyId, metricTypes?.[0] || 'views'),
      },
    };
  }

  async getEngagementMetrics(
    companyId: string,
    entityType: ContentAnalyticsEntityType,
    entityId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<{
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagementRate: number;
    clickThroughRate: number;
  }> {
    const baseQuery = this.contentMetricRepository
      .createQueryBuilder('metric')
      .where('metric.companyId = :companyId', { companyId })
      .andWhere('metric.entityType = :entityType', { entityType })
      .andWhere('metric.entityId = :entityId', { entityId });

    if (dateRange) {
      baseQuery.andWhere('metric.recordedAt BETWEEN :start AND :end', dateRange);
    }

    const [views, likes, shares, comments, clicks] = await Promise.all([
      this.getMetricSum(baseQuery, 'views'),
      this.getMetricSum(baseQuery, 'likes'),
      this.getMetricSum(baseQuery, 'shares'),
      this.getMetricSum(baseQuery, 'comments'),
      this.getMetricSum(baseQuery, 'clicks'),
    ]);

    const engagementRate = views > 0 ? ((likes + shares + comments) / views) * 100 : 0;
    const clickThroughRate = views > 0 ? (clicks / views) * 100 : 0;

    return {
      views,
      likes,
      shares,
      comments,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      clickThroughRate: parseFloat(clickThroughRate.toFixed(2)),
    };
  }

  async getConversionMetrics(
    companyId: string,
    entityType?: ContentAnalyticsEntityType,
    entityId?: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<{
    conversions: number;
    conversionValue: number;
    conversionRate: number;
    averageOrderValue: number;
  }> {
    const queryBuilder = this.conversionTrackingRepository
      .createQueryBuilder('conversion')
      .where('conversion.companyId = :companyId', { companyId });

    if (entityType) {
      queryBuilder.andWhere('conversion.entityType = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('conversion.entityId = :entityId', { entityId });
    }

    if (dateRange) {
      queryBuilder.andWhere('conversion.convertedAt BETWEEN :start AND :end', dateRange);
    }

    const conversions = await queryBuilder.getMany();
    const conversionCount = conversions.length;
    const totalValue = conversions.reduce((sum, c) => sum + c.conversionValue, 0);

    // Calculate views for conversion rate
    const viewsQuery = this.contentMetricRepository
      .createQueryBuilder('metric')
      .where('metric.companyId = :companyId', { companyId })
      .andWhere('metric.metricType = :metricType', { metricType: 'views' });

    if (entityType) {
      viewsQuery.andWhere('metric.entityType = :entityType', { entityType });
    }

    if (entityId) {
      viewsQuery.andWhere('metric.entityId = :entityId', { entityId });
    }

    if (dateRange) {
      viewsQuery.andWhere('metric.recordedAt BETWEEN :start AND :end', dateRange);
    }

    const viewsResult = await viewsQuery.select('SUM(metric.value)', 'total').getRawOne();
    const totalViews = parseInt(viewsResult?.total || '0');

    const conversionRate = totalViews > 0 ? (conversionCount / totalViews) * 100 : 0;
    const averageOrderValue = conversionCount > 0 ? totalValue / conversionCount : 0;

    return {
      conversions: conversionCount,
      conversionValue: totalValue,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
    };
  }

  private async getMetricSum(baseQuery: any, metricType: MetricType): Promise<number> {
    const result = await baseQuery
      .clone()
      .andWhere('metric.metricType = :metricType', { metricType })
      .select('SUM(metric.value)', 'total')
      .getRawOne();

    return parseInt(result?.total || '0');
  }

  private getAggregateFunction(aggregation: MetricAggregation): string {
    switch (aggregation) {
      case 'sum': return 'SUM';
      case 'avg': return 'AVG';
      case 'max': return 'MAX';
      case 'min': return 'MIN';
      case 'count': return 'COUNT';
      default: return 'SUM';
    }
  }

  private async calculateInsights(companyId: string, request: ContentMetricsRequest): Promise<string[]> {
    const insights: string[] = [];

    // Calculate period-over-period comparison
    if (request.dateRange) {
      const currentPeriod = request.dateRange;
      const previousPeriodDuration = currentPeriod.end.getTime() - currentPeriod.start.getTime();
      const previousPeriod = {
        start: new Date(currentPeriod.start.getTime() - previousPeriodDuration),
        end: currentPeriod.start,
      };

      const currentMetrics = await this.getPeriodMetrics(companyId, currentPeriod, request.metricTypes);
      const previousMetrics = await this.getPeriodMetrics(companyId, previousPeriod, request.metricTypes);

      for (const metricType of request.metricTypes || []) {
        const current = currentMetrics[metricType] || 0;
        const previous = previousMetrics[metricType] || 0;
        
        if (previous > 0) {
          const change = ((current - previous) / previous) * 100;
          const direction = change > 0 ? 'increased' : 'decreased';
          insights.push(`${metricType} ${direction} by ${Math.abs(change).toFixed(1)}% compared to the previous period`);
        }
      }
    }

    return insights;
  }

  private async getPeriodMetrics(
    companyId: string,
    dateRange: { start: Date; end: Date },
    metricTypes?: MetricType[]
  ): Promise<Record<string, number>> {
    const queryBuilder = this.contentMetricRepository
      .createQueryBuilder('metric')
      .where('metric.companyId = :companyId', { companyId })
      .andWhere('metric.recordedAt BETWEEN :start AND :end', dateRange);

    if (metricTypes?.length) {
      queryBuilder.andWhere('metric.metricType IN (:...metricTypes)', { metricTypes });
    }

    queryBuilder
      .select('metric.metricType', 'metricType')
      .addSelect('SUM(metric.value)', 'total')
      .groupBy('metric.metricType');

    const results = await queryBuilder.getRawMany();
    
    return results.reduce((acc, result) => {
      acc[result.metricType] = parseInt(result.total);
      return acc;
    }, {} as Record<string, number>);
  }

  private async getTopPerformers(
    companyId: string,
    metricType: MetricType,
    limit: number = 10
  ): Promise<Array<{ entityId: string; entityTitle: string; value: number }>> {
    const results = await this.contentMetricRepository
      .createQueryBuilder('metric')
      .where('metric.companyId = :companyId', { companyId })
      .andWhere('metric.metricType = :metricType', { metricType })
      .select('metric.entityId', 'entityId')
      .addSelect('metric.entityTitle', 'entityTitle')
      .addSelect('SUM(metric.value)', 'value')
      .groupBy('metric.entityId, metric.entityTitle')
      .orderBy('SUM(metric.value)', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map(r => ({
      entityId: r.entityId,
      entityTitle: r.entityTitle,
      value: parseInt(r.value),
    }));
  }
}