import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialMediaService } from './social-media.service';
import { SocialMediaController } from './social-media.controller';
import { ExportService } from './export.service';
import { SocialMediaPost } from '../database/entities/social-media-post.entity';
import { SocialMediaContentPlan } from '../database/entities/social-media-content-plan.entity';
import { BlogPost } from '../database/entities/blog-post.entity';
import { WriterProfile } from '../database/entities/writer-profile.entity';
import { Company } from '../database/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SocialMediaPost,
      SocialMediaContentPlan,
      BlogPost,
      WriterProfile,
      Company
    ])
  ],
  controllers: [SocialMediaController],
  providers: [SocialMediaService, ExportService],
  exports: [SocialMediaService, ExportService]
})
export class SocialMediaModule {}