import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalWorkflowsController } from './approval-workflows.controller';
import { ApprovalWorkflowsService } from './approval-workflows.service';
import { ApprovalWorkflow } from '../database/entities/approval-workflow.entity';
import { ApprovalStep } from '../database/entities/approval-step.entity';
import { ApprovalDecision } from '../database/entities/approval-decision.entity';
import { ApprovalRule } from '../database/entities/approval-rule.entity';
import { ApprovalTemplate } from '../database/entities/approval-template.entity';
import { User } from '../database/entities/user.entity';
import { BlogPost } from '../database/entities/blog-post.entity';
import { SocialMediaPost } from '../database/entities/social-media-post.entity';
import { Notification } from '../database/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApprovalWorkflow,
      ApprovalStep,
      ApprovalDecision,
      ApprovalRule,
      ApprovalTemplate,
      User,
      BlogPost,
      SocialMediaPost,
      Notification
    ])
  ],
  controllers: [ApprovalWorkflowsController],
  providers: [ApprovalWorkflowsService],
  exports: [ApprovalWorkflowsService]
})
export class ApprovalWorkflowsModule {}