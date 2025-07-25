import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentTopicsController } from './content-topics.controller';
import { ContentTopicsService } from './content-topics.service';
import { ContentTopicEntity } from '../database/entities/content-topic.entity';
import { User } from '../database/entities/user.entity';
import { Company } from '../database/entities/company.entity';
import { WriterProfile } from '../database/entities/writer-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContentTopicEntity,
      User,
      Company,
      WriterProfile
    ])
  ],
  controllers: [ContentTopicsController],
  providers: [ContentTopicsService],
  exports: [ContentTopicsService]
})
export class ContentTopicsModule {}