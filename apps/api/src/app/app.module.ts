import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { CompaniesModule } from '../companies/companies.module';
import { CompanyContextModule } from '../company-context/company-context.module';
import { WriterProfilesModule } from '../writer-profiles/writer-profiles.module';
import { ContentTopicsModule } from '../content-topics/content-topics.module';
import { BlogPostsModule } from '../blog-posts/blog-posts.module';
import { SocialMediaModule } from '../social-media/social-media.module';
import { ContentLibraryModule } from '../content-library/content-library.module';
import { VersionControlModule } from '../version-control/version-control.module';
import { RBACModule } from '../rbac/rbac.module';
import { CommentsModule } from '../comments/comments.module';
import { ApprovalWorkflowsModule } from '../approval-workflows/approval-workflows.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AIModule } from '../ai/ai.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [DatabaseModule, AuthModule, CompaniesModule, CompanyContextModule, WriterProfilesModule, ContentTopicsModule, BlogPostsModule, SocialMediaModule, ContentLibraryModule, VersionControlModule, RBACModule, CommentsModule, ApprovalWorkflowsModule, AnalyticsModule, AIModule, SecurityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}