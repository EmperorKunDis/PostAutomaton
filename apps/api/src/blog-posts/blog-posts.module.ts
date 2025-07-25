import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPostsService } from './blog-posts.service';
import { BlogPost } from '../database/entities/blog-post.entity';
import { BlogPostSection } from '../database/entities/blog-post-section.entity';
import { ContentTopic } from '../database/entities/content-topic.entity';
import { WriterProfile } from '../database/entities/writer-profile.entity';
import { Company } from '../database/entities/company.entity';
import { VersionControlModule } from '../version-control/version-control.module';
import { RBACModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogPost,
      BlogPostSection,
      ContentTopic,
      WriterProfile,
      Company
    ]),
    VersionControlModule,
    RBACModule
  ],
  controllers: [BlogPostsController],
  providers: [BlogPostsService],
  exports: [BlogPostsService]
})
export class BlogPostsModule {}