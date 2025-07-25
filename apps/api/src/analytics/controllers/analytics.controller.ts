import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { ContentMetricsService } from '../services/content-metrics.service';
import { ABTestService } from '../services/ab-test.service';
import { AutomatedReportService } from '../services/automated-report.service';
import { 
  User,
  ContentMetricsRequest,
  ContentMetricsResponse,
  TrackContentMetricRequest,
  CreateABTestRequest,
  CreateAutomatedReportRequest,
  ContentAnalyticsEntityType,
  MetricType
} from '@internal-marketing-content-app/shared';

@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnalyticsController {
  constructor(
    private contentMetricsService: ContentMetricsService,
    private abTestService: ABTestService,
    private automatedReportService: AutomatedReportService,
  ) {}

  @Post('track')
  @RequirePermissions('analytics:create')
  async trackMetric(
    @Body() request: TrackContentMetricRequest,
    @GetUser() user: User
  ) {
    return this.contentMetricsService.trackMetric({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Post('metrics')
  @RequirePermissions('analytics:read')
  async getContentMetrics(
    @Body() request: ContentMetricsRequest,
    @GetUser() user: User
  ): Promise<ContentMetricsResponse> {
    return this.contentMetricsService.getContentMetrics({
      ...request,
      companyId: user.companyId,
    });
  }

  @Get('engagement/:entityType/:entityId')
  @RequirePermissions('analytics:read')
  async getEngagementMetrics(
    @Param('entityType') entityType: ContentAnalyticsEntityType,
    @Param('entityId') entityId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @GetUser() user: User
  ) {
    const dateRange = startDate && endDate ? {
      start: new Date(startDate),
      end: new Date(endDate),
    } : undefined;

    return this.contentMetricsService.getEngagementMetrics(
      user.companyId,
      entityType,
      entityId,
      dateRange
    );
  }

  @Get('conversions')
  @RequirePermissions('analytics:read')
  async getConversionMetrics(
    @Query('entityType') entityType?: ContentAnalyticsEntityType,
    @Query('entityId') entityId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @GetUser() user: User
  ) {
    const dateRange = startDate && endDate ? {
      start: new Date(startDate),
      end: new Date(endDate),
    } : undefined;

    return this.contentMetricsService.getConversionMetrics(
      user.companyId,
      entityType,
      entityId,
      dateRange
    );
  }

  @Get('dashboard')
  @RequirePermissions('analytics:read')
  async getDashboardData(
    @Query('period') period: 'week' | 'month' | 'quarter' = 'month',
    @GetUser() user: User
  ) {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
    }

    const [engagement, conversions, topContent] = await Promise.all([
      this.contentMetricsService.getContentMetrics({
        companyId: user.companyId,
        metricTypes: ['views', 'likes', 'shares', 'comments'],
        dateRange: { start: startDate, end: endDate },
        groupBy: ['date'],
        aggregation: 'sum',
      }),
      this.contentMetricsService.getConversionMetrics(
        user.companyId,
        undefined,
        undefined,
        { start: startDate, end: endDate }
      ),
      this.contentMetricsService.getContentMetrics({
        companyId: user.companyId,
        metricTypes: ['views'],
        dateRange: { start: startDate, end: endDate },
        groupBy: ['entityType', 'entityId'],
        aggregation: 'sum',
      }),
    ]);

    return {
      period,
      dateRange: { start: startDate, end: endDate },
      engagement,
      conversions,
      topContent: topContent.summary.topPerformers,
    };
  }

  // A/B Testing endpoints
  @Post('ab-tests')
  @RequirePermissions('analytics:create')
  async createABTest(
    @Body() request: CreateABTestRequest,
    @GetUser() user: User
  ) {
    return this.abTestService.createABTest({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Get('ab-tests')
  @RequirePermissions('analytics:read')
  async getABTests(
    @Query('status') status?: string,
    @GetUser() user: User
  ) {
    return this.abTestService.getABTests(user.companyId, status as any);
  }

  @Get('ab-tests/:id')
  @RequirePermissions('analytics:read')
  async getABTest(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return this.abTestService.getABTest(id, user.companyId);
  }

  @Post('ab-tests/:id/start')
  @RequirePermissions('analytics:update')
  async startABTest(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return this.abTestService.startABTest(id, user.companyId);
  }

  @Post('ab-tests/:id/stop')
  @RequirePermissions('analytics:update')
  async stopABTest(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return this.abTestService.stopABTest(id, user.companyId);
  }

  @Get('ab-tests/:id/results')
  @RequirePermissions('analytics:read')
  async getABTestResults(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return this.abTestService.getABTestResults(id, user.companyId);
  }

  // Automated Reports endpoints
  @Post('reports')
  @RequirePermissions('analytics:create')
  async createAutomatedReport(
    @Body() request: CreateAutomatedReportRequest,
    @GetUser() user: User
  ) {
    return this.automatedReportService.createReport({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Get('reports')
  @RequirePermissions('analytics:read')
  async getAutomatedReports(
    @GetUser() user: User
  ) {
    return this.automatedReportService.getReports(user.companyId);
  }

  @Get('reports/:id')
  @RequirePermissions('analytics:read')
  async getAutomatedReport(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return this.automatedReportService.getReport(id, user.companyId);
  }

  @Post('reports/:id/run')
  @RequirePermissions('analytics:update')
  async runReport(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return this.automatedReportService.runReport(id, user.companyId);
  }

  @Get('reports/:id/executions')
  @RequirePermissions('analytics:read')
  async getReportExecutions(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return this.automatedReportService.getReportExecutions(id, user.companyId);
  }

  @Post('reports/:id/toggle')
  @RequirePermissions('analytics:update')
  async toggleReport(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return this.automatedReportService.toggleReport(id, user.companyId);
  }
}