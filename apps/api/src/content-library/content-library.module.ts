import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentLibraryService } from './content-library.service';
import { ContentLibraryController } from './content-library.controller';
import { ContentAsset } from '../database/entities/content-asset.entity';
import { ContentTag } from '../database/entities/content-tag.entity';
import { ReusableSnippet } from '../database/entities/reusable-snippet.entity';
import { MediaAsset } from '../database/entities/media-asset.entity';
import { AssetUsage } from '../database/entities/asset-usage.entity';
import { BlogPost } from '../database/entities/blog-post.entity';
import { SocialMediaPost } from '../database/entities/social-media-post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContentAsset,
      ContentTag,
      ReusableSnippet,
      MediaAsset,
      AssetUsage,
      BlogPost,
      SocialMediaPost
    ])
  ],
  controllers: [ContentLibraryController],
  providers: [ContentLibraryService],
  exports: [ContentLibraryService]
})
export class ContentLibraryModule {}