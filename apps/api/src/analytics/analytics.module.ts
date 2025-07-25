import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { AnalyticsController } from './controllers/analytics.controller';

// Services
import { ContentMetricsService } from './services/content-metrics.service';
import { PlatformIntegrationService } from './services/platform-integration.service';
import { ABTestService } from './services/ab-test.service';
import { AutomatedReportService } from './services/automated-report.service';

// Entities
import { ContentMetric } from '../database/entities/content-metric.entity';
import { PlatformIntegration } from '../database/entities/platform-integration.entity';
import { EngagementDashboard } from '../database/entities/engagement-dashboard.entity';
import { DashboardWidget } from '../database/entities/dashboard-widget.entity';
import { ABTest } from '../database/entities/ab-test.entity';
import { ABTestVariant } from '../database/entities/ab-test-variant.entity';
import { ConversionEvent } from '../database/entities/conversion-event.entity';
import { ConversionTracking } from '../database/entities/conversion-tracking.entity';
import { AutomatedReport } from '../database/entities/automated-report.entity';
import { ReportExecution } from '../database/entities/report-execution.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContentMetric,
      PlatformIntegration,
      EngagementDashboard,
      DashboardWidget,
      ABTest,
      ABTestVariant,
      ConversionEvent,
      ConversionTracking,
      AutomatedReport,
      ReportExecution,
    ]),
  ],
  controllers: [
    AnalyticsController,
  ],
  providers: [
    ContentMetricsService,
    PlatformIntegrationService,
    ABTestService,
    AutomatedReportService,
  ],
  exports: [
    ContentMetricsService,
    PlatformIntegrationService,
    ABTestService,
    AutomatedReportService,
  ],
})
export class AnalyticsModule {}