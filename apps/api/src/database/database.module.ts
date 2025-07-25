import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';
import { WriterProfile } from './entities/writer-profile.entity';
import { CompanyContext } from './entities/company-context.entity';
import { ContentTopicEntity } from './entities/content-topic.entity';
import { ContentPlanEntity } from './entities/content-plan.entity';
import { BlogPost } from './entities/blog-post.entity';
import { BlogPostSection } from './entities/blog-post-section.entity';
import { SocialMediaPost } from './entities/social-media-post.entity';
import { SocialMediaContentPlan } from './entities/social-media-content-plan.entity';
import { ContentAsset } from './entities/content-asset.entity';
import { ContentTag } from './entities/content-tag.entity';
import { ReusableSnippet } from './entities/reusable-snippet.entity';
import { MediaAsset } from './entities/media-asset.entity';
import { AssetUsage } from './entities/asset-usage.entity';
import { ContentVersion } from './entities/content-version.entity';
import { ContentRevision } from './entities/content-revision.entity';
import { Comment } from './entities/comment.entity';
import { Notification } from './entities/notification.entity';
import { ApprovalWorkflow } from './entities/approval-workflow.entity';
import { ApprovalStep } from './entities/approval-step.entity';
import { ApprovalDecision } from './entities/approval-decision.entity';
import { ApprovalRule } from './entities/approval-rule.entity';
import { ApprovalTemplate } from './entities/approval-template.entity';
import { ContentMetric } from './entities/content-metric.entity';
import { PlatformIntegration } from './entities/platform-integration.entity';
import { EngagementDashboard } from './entities/engagement-dashboard.entity';
import { DashboardWidget } from './entities/dashboard-widget.entity';
import { ABTest } from './entities/ab-test.entity';
import { ABTestVariant } from './entities/ab-test-variant.entity';
import { ConversionEvent } from './entities/conversion-event.entity';
import { ConversionTracking } from './entities/conversion-tracking.entity';
import { AutomatedReport } from './entities/automated-report.entity';
import { ReportExecution } from './entities/report-execution.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.NODE_ENV === 'test' ? ':memory:' : 'data.sqlite',
      entities: [User, Company, WriterProfile, CompanyContext, ContentTopicEntity, ContentPlanEntity, BlogPost, BlogPostSection, SocialMediaPost, SocialMediaContentPlan, ContentAsset, ContentTag, ReusableSnippet, MediaAsset, AssetUsage, ContentVersion, ContentRevision, Comment, Notification, ApprovalWorkflow, ApprovalStep, ApprovalDecision, ApprovalRule, ApprovalTemplate, ContentMetric, PlatformIntegration, EngagementDashboard, DashboardWidget, ABTest, ABTestVariant, ConversionEvent, ConversionTracking, AutomatedReport, ReportExecution],
      synchronize: true, // Auto-sync in development
      logging: process.env.NODE_ENV === 'development',
      // PostgreSQL config (commented for now - use when DB is available)
      // type: 'postgres',
      // host: process.env.DB_HOST || 'localhost',
      // port: parseInt(process.env.DB_PORT, 10) || 5432,
      // username: process.env.DB_USERNAME || 'postgres',
      // password: process.env.DB_PASSWORD || 'password',
      // database: process.env.DB_NAME || 'internal_marketing_content',
      // migrations: ['dist/apps/api/src/database/migrations/*.js'],
      // migrationsRun: true,
    }),
    TypeOrmModule.forFeature([User, Company, WriterProfile, CompanyContext, ContentTopicEntity, ContentPlanEntity, BlogPost, BlogPostSection, SocialMediaPost, SocialMediaContentPlan, ContentAsset, ContentTag, ReusableSnippet, MediaAsset, AssetUsage, ContentVersion, ContentRevision, Comment, Notification, ApprovalWorkflow, ApprovalStep, ApprovalDecision, ApprovalRule, ApprovalTemplate, ContentMetric, PlatformIntegration, EngagementDashboard, DashboardWidget, ABTest, ABTestVariant, ConversionEvent, ConversionTracking, AutomatedReport, ReportExecution]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}