import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from '../database/entities/comment.entity';
import { Notification } from '../database/entities/notification.entity';
import { User } from '../database/entities/user.entity';
import { BlogPost } from '../database/entities/blog-post.entity';
import { BlogPostSection } from '../database/entities/blog-post-section.entity';
import { SocialMediaPost } from '../database/entities/social-media-post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Comment,
      Notification,
      User,
      BlogPost,
      BlogPostSection,
      SocialMediaPost
    ])
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService]
})
export class CommentsModule {}