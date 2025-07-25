import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionControlService } from './version-control.service';
import { VersionControlController } from './version-control.controller';
import { ContentVersion } from '../database/entities/content-version.entity';
import { ContentRevision } from '../database/entities/content-revision.entity';
import { BlogPost } from '../database/entities/blog-post.entity';
import { BlogPostSection } from '../database/entities/blog-post-section.entity';
import { SocialMediaPost } from '../database/entities/social-media-post.entity';
import { ReusableSnippet } from '../database/entities/reusable-snippet.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContentVersion,
      ContentRevision,
      BlogPost,
      BlogPostSection,
      SocialMediaPost,
      ReusableSnippet,
      User
    ])
  ],
  controllers: [VersionControlController],
  providers: [VersionControlService],
  exports: [VersionControlService]
})
export class VersionControlModule {}