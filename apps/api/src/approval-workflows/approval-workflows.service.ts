import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In, Between } from 'typeorm';
import { ApprovalWorkflow } from '../database/entities/approval-workflow.entity';
import { ApprovalStep } from '../database/entities/approval-step.entity';
import { ApprovalDecision } from '../database/entities/approval-decision.entity';
import { ApprovalRule } from '../database/entities/approval-rule.entity';
import { ApprovalTemplate } from '../database/entities/approval-template.entity';
import { User } from '../database/entities/user.entity';
import { BlogPost } from '../database/entities/blog-post.entity';
import { SocialMediaPost } from '../database/entities/social-media-post.entity';
import { Notification } from '../database/entities/notification.entity';
import {
  CreateApprovalWorkflowRequest,
  UpdateApprovalWorkflowRequest,
  SubmitForApprovalRequest,
  MakeApprovalDecisionRequest,
  BulkApprovalRequest,
  ApprovalWorkflowsRequest,
  ApprovalWorkflowsResponse,
  ApprovalWorkflowDetailsResponse,
  ApprovalDashboardStats,
  CreateApprovalRuleRequest,
  UpdateApprovalRuleRequest,
  ApprovalRulesResponse,
  CreateApprovalTemplateRequest,
  ApprovalTemplatesResponse,
  ApprovalWorkflowStatus,
  ApprovalEntityType,
  ApprovalAction,
  ApprovalTimelineEvent,
  ApprovalRuleCondition,
  ApprovalRuleStep
} from '@internal-marketing-content-app/shared';

@Injectable()
export class ApprovalWorkflowsService {
  constructor(
    @InjectRepository(ApprovalWorkflow)
    private workflowRepository: Repository<ApprovalWorkflow>,
    
    @InjectRepository(ApprovalStep)
    private stepRepository: Repository<ApprovalStep>,
    
    @InjectRepository(ApprovalDecision)
    private decisionRepository: Repository<ApprovalDecision>,
    
    @InjectRepository(ApprovalRule)
    private ruleRepository: Repository<ApprovalRule>,
    
    @InjectRepository(ApprovalTemplate)
    private templateRepository: Repository<ApprovalTemplate>,
    
    @InjectRepository(User)
    private userRepository: Repository<User>,
    
    @InjectRepository(BlogPost)
    private blogPostRepository: Repository<BlogPost>,
    
    @InjectRepository(SocialMediaPost)
    private socialMediaPostRepository: Repository<SocialMediaPost>,
    
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    
    private entityManager: EntityManager
  ) {}

  async createWorkflow(request: CreateApprovalWorkflowRequest, userId: string): Promise<ApprovalWorkflow> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate entity exists
    await this.validateEntityExists(request.entityType, request.entityId, user.companyId);

    return await this.entityManager.transaction(async (transactionalEntityManager) => {
      // Determine workflow steps
      let steps: ApprovalRuleStep[] = [];
      
      if (request.templateId) {
        const template = await this.templateRepository.findOne({
          where: { id: request.templateId, companyId: user.companyId }
        });
        
        if (!template) {
          throw new NotFoundException('Template not found');
        }
        
        steps = template.steps;
        await transactionalEntityManager.update(ApprovalTemplate, 
          { id: template.id }, 
          { timesUsed: () => 'timesUsed + 1' }
        );
      } else if (request.customSteps) {
        steps = request.customSteps;
      } else {
        // Find matching approval rules
        const matchingRule = await this.findMatchingApprovalRule(
          request.entityType, 
          request.entityId, 
          user.companyId
        );
        
        if (matchingRule) {
          steps = matchingRule.steps;
        } else {
          // Default single-step approval
          steps = [{
            stepNumber: 1,
            name: 'Review',
            description: 'Content review and approval',
            assignmentType: 'role_based',
            assignmentValue: ['Editor', 'Admin'],
            requiresAllReviewers: false,
            allowParallelReview: true,
            maxReviewTime: 24,
            escalationEnabled: false
          }];
        }
      }

      // Create workflow
      const workflow = transactionalEntityManager.create(ApprovalWorkflow, {
        entityType: request.entityType,
        entityId: request.entityId,
        entityTitle: request.entityTitle,
        status: 'draft' as ApprovalWorkflowStatus,
        currentStage: 1,
        totalStages: steps.length,
        authorId: userId,
        authorName: user.name,
        companyId: user.companyId,
        assignedReviewers: request.assignedReviewers || [],
        requiresSequentialApproval: steps.length > 1,
        minimumApprovals: 1,
        currentApprovals: 0,
        priority: request.priority || 'medium',
        dueDate: request.dueDate,
        metadata: request.metadata
      });

      const savedWorkflow = await transactionalEntityManager.save(ApprovalWorkflow, workflow);

      // Create workflow steps
      for (const stepConfig of steps) {
        const assignedReviewers = await this.resolveReviewerAssignment(
          stepConfig, 
          user.companyId, 
          request.assignedReviewers
        );

        const step = transactionalEntityManager.create(ApprovalStep, {
          workflowId: savedWorkflow.id,
          stepNumber: stepConfig.stepNumber,
          name: stepConfig.name,
          description: stepConfig.description,
          assignedReviewers: assignedReviewers.map(r => r.id),
          reviewerNames: assignedReviewers.map(r => r.name),
          requiresAllReviewers: stepConfig.requiresAllReviewers,
          allowParallelReview: stepConfig.allowParallelReview,
          status: stepConfig.stepNumber === 1 ? 'pending' : 'pending'
        });

        await transactionalEntityManager.save(ApprovalStep, step);
      }

      return savedWorkflow;
    });
  }

  async submitForApproval(request: SubmitForApprovalRequest, userId: string): Promise<ApprovalWorkflow> {
    const workflow = await this.workflowRepository.findOne({
      where: { id: request.workflowId },
      relations: ['author', 'steps']
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    if (workflow.authorId !== userId) {
      throw new ForbiddenException('Only the author can submit for approval');
    }

    if (workflow.status !== 'draft') {
      throw new BadRequestException('Workflow is not in draft status');
    }

    return await this.entityManager.transaction(async (transactionalEntityManager) => {
      // Update workflow status
      await transactionalEntityManager.update(ApprovalWorkflow, 
        { id: workflow.id },
        {
          status: 'pending_review' as ApprovalWorkflowStatus,
          submittedAt: new Date()
        }
      );

      // Start first step
      const firstStep = workflow.steps.find(s => s.stepNumber === 1);
      if (firstStep) {
        await transactionalEntityManager.update(ApprovalStep,
          { id: firstStep.id },
          {
            status: 'in_progress',
            startedAt: new Date()
          }
        );

        // Create notifications for reviewers
        await this.createReviewerNotifications(
          workflow,
          firstStep.assignedReviewers,
          'approval_request',
          request.message,
          transactionalEntityManager
        );
      }

      return await transactionalEntityManager.findOne(ApprovalWorkflow, {
        where: { id: workflow.id },
        relations: ['steps']
      }) as ApprovalWorkflow;
    });
  }

  async makeDecision(request: MakeApprovalDecisionRequest, userId: string): Promise<ApprovalDecision> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const workflow = await this.workflowRepository.findOne({
      where: { id: request.workflowId },
      relations: ['steps', 'author']
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const step = await this.stepRepository.findOne({
      where: { id: request.stepId },
      relations: ['approvals']
    });

    if (!step) {
      throw new NotFoundException('Step not found');
    }

    // Check if user is assigned to this step
    if (!step.assignedReviewers.includes(userId)) {
      throw new ForbiddenException('You are not assigned to review this step');
    }

    // Check if user has already made a decision
    const existingDecision = step.approvals.find(a => a.reviewerId === userId);
    if (existingDecision) {
      throw new BadRequestException('You have already made a decision for this step');
    }

    return await this.entityManager.transaction(async (transactionalEntityManager) => {
      // Create decision
      const decision = transactionalEntityManager.create(ApprovalDecision, {
        workflowId: workflow.id,
        stepId: step.id,
        action: this.mapDecisionToAction(request.decision),
        decision: request.decision,
        reviewerId: userId,
        reviewerName: user.name,
        reviewerRole: user.role,
        comment: request.comment,
        changeRequests: request.changeRequests,
        decidedAt: new Date(),
        originalContent: await this.getEntityContent(workflow.entityType, workflow.entityId),
        suggestedChanges: request.suggestedChanges
      });

      const savedDecision = await transactionalEntityManager.save(ApprovalDecision, decision);

      // Update step status based on decision and requirements
      await this.updateStepStatus(step, request.decision, transactionalEntityManager);

      // Check if workflow is complete
      await this.checkWorkflowCompletion(workflow, transactionalEntityManager);

      return savedDecision;
    });
  }

  async bulkApproval(request: BulkApprovalRequest, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const workflows = await this.workflowRepository.find({
      where: { id: In(request.workflowIds) },
      relations: ['steps']
    });

    await this.entityManager.transaction(async (transactionalEntityManager) => {
      for (const workflow of workflows) {
        const currentStep = workflow.steps.find(s => s.status === 'in_progress');
        
        if (currentStep && currentStep.assignedReviewers.includes(userId)) {
          const decisionRequest: MakeApprovalDecisionRequest = {
            workflowId: workflow.id,
            stepId: currentStep.id,
            decision: request.decision,
            comment: request.comment
          };

          // Create decision
          const decision = transactionalEntityManager.create(ApprovalDecision, {
            workflowId: workflow.id,
            stepId: currentStep.id,
            action: this.mapDecisionToAction(request.decision),
            decision: request.decision,
            reviewerId: userId,
            reviewerName: user.name,
            reviewerRole: user.role,
            comment: request.comment,
            decidedAt: new Date()
          });

          await transactionalEntityManager.save(ApprovalDecision, decision);

          // Update step and workflow status
          await this.updateStepStatus(currentStep, request.decision, transactionalEntityManager);
          await this.checkWorkflowCompletion(workflow, transactionalEntityManager);
        }
      }
    });
  }

  async getWorkflows(request: ApprovalWorkflowsRequest, userId: string): Promise<ApprovalWorkflowsResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.workflowRepository.createQueryBuilder('workflow')
      .leftJoinAndSelect('workflow.author', 'author')
      .leftJoinAndSelect('workflow.steps', 'steps')
      .where('workflow.companyId = :companyId', { companyId: user.companyId });

    // Apply filters
    if (request.status) {
      if (Array.isArray(request.status)) {
        queryBuilder.andWhere('workflow.status IN (:...statuses)', { statuses: request.status });
      } else {
        queryBuilder.andWhere('workflow.status = :status', { status: request.status });
      }
    }

    if (request.entityType) {
      queryBuilder.andWhere('workflow.entityType = :entityType', { entityType: request.entityType });
    }

    if (request.assignedToMe) {
      queryBuilder.andWhere(':userId = ANY(workflow.assignedReviewers)', { userId });
    }

    if (request.authoredByMe) {
      queryBuilder.andWhere('workflow.authorId = :userId', { userId });
    }

    if (request.priority) {
      queryBuilder.andWhere('workflow.priority = :priority', { priority: request.priority });
    }

    if (request.dueDate) {
      if (request.dueDate.from) {
        queryBuilder.andWhere('workflow.dueDate >= :fromDate', { fromDate: request.dueDate.from });
      }
      if (request.dueDate.to) {
        queryBuilder.andWhere('workflow.dueDate <= :toDate', { toDate: request.dueDate.to });
      }
    }

    // Sorting
    const sortField = request.sort?.field || 'updatedAt';
    const sortDirection = request.sort?.direction || 'desc';
    queryBuilder.orderBy(`workflow.${sortField}`, sortDirection.toUpperCase() as 'ASC' | 'DESC');

    // Pagination
    const page = request.pagination?.page || 1;
    const limit = request.pagination?.limit || 50;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    const [workflows, totalCount] = await queryBuilder.getManyAndCount();

    // Calculate summary statistics
    const summaryQuery = this.workflowRepository.createQueryBuilder('workflow')
      .select('workflow.status, COUNT(*) as count')
      .where('workflow.companyId = :companyId', { companyId: user.companyId })
      .groupBy('workflow.status');

    const statusCounts = await summaryQuery.getRawMany();
    const byStatus = statusCounts.reduce((acc, item) => {
      acc[item.workflow_status] = parseInt(item.count);
      return acc;
    }, {});

    const priorityQuery = this.workflowRepository.createQueryBuilder('workflow')
      .select('workflow.priority, COUNT(*) as count')
      .where('workflow.companyId = :companyId', { companyId: user.companyId })
      .groupBy('workflow.priority');

    const priorityCounts = await priorityQuery.getRawMany();
    const byPriority = priorityCounts.reduce((acc, item) => {
      acc[item.workflow_priority] = parseInt(item.count);
      return acc;
    }, {});

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const overdueCount = await this.workflowRepository.count({
      where: {
        companyId: user.companyId,
        dueDate: Between(new Date('1900-01-01'), now),
        status: In(['pending_review', 'in_review'])
      }
    });

    const dueSoonCount = await this.workflowRepository.count({
      where: {
        companyId: user.companyId,
        dueDate: Between(now, tomorrow),
        status: In(['pending_review', 'in_review'])
      }
    });

    return {
      workflows,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      summary: {
        byStatus,
        byPriority,
        overdueCount,
        dueSoonCount
      }
    };
  }

  async getWorkflowDetails(workflowId: string, userId: string): Promise<ApprovalWorkflowDetailsResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
      relations: ['author', 'steps', 'steps.approvals', 'steps.approvals.reviewer']
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    // Check access permissions
    const hasAccess = workflow.authorId === userId ||
                     workflow.assignedReviewers.includes(userId) ||
                     workflow.steps.some(step => step.assignedReviewers.includes(userId)) ||
                     user.role === 'Admin';

    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this workflow');
    }

    // Get entity data
    const entityData = await this.getEntityContent(workflow.entityType, workflow.entityId);

    // Generate timeline
    const timeline = await this.generateWorkflowTimeline(workflow);

    // Check permissions
    const canApprove = workflow.steps.some(step => 
      step.status === 'in_progress' && step.assignedReviewers.includes(userId)
    );
    const canReject = canApprove;
    const canEdit = workflow.authorId === userId && workflow.status === 'draft';
    const canReassign = user.role === 'Admin' || user.role === 'Editor';

    return {
      workflow,
      steps: workflow.steps,
      decisions: workflow.steps.flatMap(step => step.approvals),
      entityData,
      canApprove,
      canReject,
      canEdit,
      canReassign,
      timeline
    };
  }

  async getDashboardStats(userId: string): Promise<ApprovalDashboardStats> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const companyId = user.companyId;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Basic counts
    const totalWorkflows = await this.workflowRepository.count({
      where: { companyId }
    });

    const pendingReview = await this.workflowRepository.count({
      where: { 
        companyId,
        status: In(['pending_review', 'in_review'])
      }
    });

    const awaitingMyReview = await this.workflowRepository.count({
      where: {
        companyId,
        status: In(['pending_review', 'in_review']),
        assignedReviewers: JSON.stringify([userId]) // This is SQLite-specific
      }
    });

    const approvedToday = await this.workflowRepository.count({
      where: {
        companyId,
        status: 'approved',
        completedAt: Between(startOfToday, now)
      }
    });

    const rejectedToday = await this.workflowRepository.count({
      where: {
        companyId,
        status: 'rejected',
        completedAt: Between(startOfToday, now)
      }
    });

    const overdueItems = await this.workflowRepository.count({
      where: {
        companyId,
        dueDate: Between(new Date('1900-01-01'), now),
        status: In(['pending_review', 'in_review'])
      }
    });

    // Generate mock data for charts (in a real app, this would be calculated from actual data)
    const approvalTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      approvalTrends.push({
        date: date.toISOString().split('T')[0],
        approved: Math.floor(Math.random() * 10),
        rejected: Math.floor(Math.random() * 3),
        pending: Math.floor(Math.random() * 15)
      });
    }

    return {
      totalWorkflows,
      pendingReview,
      awaitingMyReview,
      approvedToday,
      rejectedToday,
      overdueItems,
      approvalTrends,
      reviewerPerformance: [], // Would be calculated from actual data
      contentTypeBreakdown: []  // Would be calculated from actual data
    };
  }

  // Helper methods
  private async validateEntityExists(entityType: ApprovalEntityType, entityId: string, companyId: string): Promise<void> {
    let entity;

    switch (entityType) {
      case 'blog_post':
        entity = await this.blogPostRepository.findOne({
          where: { id: entityId, companyId }
        });
        break;
      case 'social_post':
        entity = await this.socialMediaPostRepository.findOne({
          where: { id: entityId }
        });
        break;
      // Add other entity types as needed
      default:
        throw new BadRequestException(`Unsupported entity type: ${entityType}`);
    }

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
  }

  private async findMatchingApprovalRule(entityType: ApprovalEntityType, entityId: string, companyId: string): Promise<ApprovalRule | null> {
    const rules = await this.ruleRepository.find({
      where: {
        companyId,
        entityType,
        isActive: true
      },
      order: { priority: 'DESC' }
    });

    // Simple rule matching - in a real app, this would evaluate conditions
    return rules[0] || null;
  }

  private async resolveReviewerAssignment(stepConfig: ApprovalRuleStep, companyId: string, preAssignedReviewers?: string[]): Promise<User[]> {
    if (preAssignedReviewers && preAssignedReviewers.length > 0) {
      return await this.userRepository.find({
        where: {
          id: In(preAssignedReviewers),
          companyId,
          isActive: true
        }
      });
    }

    switch (stepConfig.assignmentType) {
      case 'specific_users':
        return await this.userRepository.find({
          where: {
            id: In(stepConfig.assignmentValue),
            companyId,
            isActive: true
          }
        });

      case 'role_based':
        return await this.userRepository.find({
          where: {
            role: In(stepConfig.assignmentValue),
            companyId,
            isActive: true
          }
        });

      default:
        // Fallback to Editors and Admins
        return await this.userRepository.find({
          where: {
            role: In(['Editor', 'Admin']),
            companyId,
            isActive: true
          }
        });
    }
  }

  private mapDecisionToAction(decision: string): ApprovalAction {
    switch (decision) {
      case 'approved':
        return 'approve';
      case 'rejected':
        return 'reject';
      case 'changes_requested':
        return 'request_changes';
      default:
        return 'approve';
    }
  }

  private async updateStepStatus(step: ApprovalStep, decision: string, transactionalEntityManager: EntityManager): Promise<void> {
    if (decision === 'approved') {
      if (!step.requiresAllReviewers) {
        // Any one approval is sufficient
        await transactionalEntityManager.update(ApprovalStep,
          { id: step.id },
          {
            status: 'approved',
            finalDecision: 'approved',
            completedAt: new Date()
          }
        );
      }
    } else if (decision === 'rejected') {
      await transactionalEntityManager.update(ApprovalStep,
        { id: step.id },
        {
          status: 'rejected',
          finalDecision: 'rejected',
          completedAt: new Date()
        }
      );
    }
  }

  private async checkWorkflowCompletion(workflow: ApprovalWorkflow, transactionalEntityManager: EntityManager): Promise<void> {
    const steps = await transactionalEntityManager.find(ApprovalStep, {
      where: { workflowId: workflow.id },
      order: { stepNumber: 'ASC' }
    });

    const currentStep = steps.find(s => s.stepNumber === workflow.currentStage);
    
    if (currentStep?.status === 'approved') {
      if (workflow.currentStage < workflow.totalStages) {
        // Move to next step
        const nextStep = steps.find(s => s.stepNumber === workflow.currentStage + 1);
        if (nextStep) {
          await transactionalEntityManager.update(ApprovalWorkflow,
            { id: workflow.id },
            {
              currentStage: workflow.currentStage + 1,
              status: 'in_review' as ApprovalWorkflowStatus
            }
          );

          await transactionalEntityManager.update(ApprovalStep,
            { id: nextStep.id },
            {
              status: 'in_progress',
              startedAt: new Date()
            }
          );
        }
      } else {
        // Workflow complete
        await transactionalEntityManager.update(ApprovalWorkflow,
          { id: workflow.id },
          {
            status: 'approved' as ApprovalWorkflowStatus,
            completedAt: new Date()
          }
        );
      }
    } else if (currentStep?.status === 'rejected') {
      await transactionalEntityManager.update(ApprovalWorkflow,
        { id: workflow.id },
        {
          status: 'rejected' as ApprovalWorkflowStatus,
          completedAt: new Date()
        }
      );
    }
  }

  private async createReviewerNotifications(
    workflow: ApprovalWorkflow,
    reviewerIds: string[],
    type: string,
    message?: string,
    transactionalEntityManager?: EntityManager
  ): Promise<void> {
    const entityManager = transactionalEntityManager || this.entityManager;

    for (const reviewerId of reviewerIds) {
      const notification = entityManager.create(Notification, {
        type: type as any,
        status: 'unread',
        userId: reviewerId,
        triggeredBy: workflow.authorId,
        triggeredByName: workflow.authorName,
        entityType: 'blog_post', // Map from ApprovalEntityType to CommentEntityType
        entityId: workflow.entityId,
        entityTitle: workflow.entityTitle,
        title: `New approval request from ${workflow.authorName}`,
        message: message || `Please review "${workflow.entityTitle}"`,
        metadata: { workflowId: workflow.id }
      });

      await entityManager.save(Notification, notification);
    }
  }

  private async getEntityContent(entityType: ApprovalEntityType, entityId: string): Promise<any> {
    switch (entityType) {
      case 'blog_post':
        return await this.blogPostRepository.findOne({
          where: { id: entityId },
          relations: ['sections']
        });
      case 'social_post':
        return await this.socialMediaPostRepository.findOne({
          where: { id: entityId }
        });
      default:
        return null;
    }
  }

  private async generateWorkflowTimeline(workflow: ApprovalWorkflow): Promise<ApprovalTimelineEvent[]> {
    const timeline: ApprovalTimelineEvent[] = [];

    // Add creation event
    timeline.push({
      id: `created_${workflow.id}`,
      type: 'created',
      title: 'Workflow Created',
      description: `Approval workflow created by ${workflow.authorName}`,
      userId: workflow.authorId,
      userName: workflow.authorName,
      timestamp: workflow.createdAt
    });

    // Add submission event
    if (workflow.submittedAt) {
      timeline.push({
        id: `submitted_${workflow.id}`,
        type: 'submitted',
        title: 'Submitted for Review',
        description: `Content submitted for approval by ${workflow.authorName}`,
        userId: workflow.authorId,
        userName: workflow.authorName,
        timestamp: workflow.submittedAt
      });
    }

    // Add decision events
    for (const step of workflow.steps) {
      for (const decision of step.approvals) {
        timeline.push({
          id: `decision_${decision.id}`,
          type: decision.decision === 'approved' ? 'approved' : 'rejected',
          title: `${decision.decision === 'approved' ? 'Approved' : 'Rejected'} by ${decision.reviewerName}`,
          description: decision.comment || `${decision.reviewerName} ${decision.decision} this content`,
          userId: decision.reviewerId,
          userName: decision.reviewerName,
          timestamp: decision.decidedAt
        });
      }
    }

    return timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async updateWorkflow(request: UpdateApprovalWorkflowRequest, userId: string): Promise<ApprovalWorkflow> {
    const workflow = await this.workflowRepository.findOne({
      where: { id: request.id }
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    const canEdit = workflow.authorId === userId || user.role === 'Admin' || user.role === 'Editor';
    if (!canEdit) {
      throw new ForbiddenException('You do not have permission to edit this workflow');
    }

    await this.workflowRepository.update(
      { id: request.id },
      {
        assignedReviewers: request.assignedReviewers,
        priority: request.priority,
        dueDate: request.dueDate,
        metadata: request.metadata
      }
    );

    return await this.workflowRepository.findOne({
      where: { id: request.id },
      relations: ['author', 'steps']
    }) as ApprovalWorkflow;
  }

  async deleteWorkflow(workflowId: string, userId: string): Promise<void> {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId }
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    const canDelete = workflow.authorId === userId || user.role === 'Admin';
    if (!canDelete) {
      throw new ForbiddenException('You do not have permission to delete this workflow');
    }

    // Can only delete draft workflows
    if (workflow.status !== 'draft') {
      throw new BadRequestException('Can only delete draft workflows');
    }

    await this.workflowRepository.delete({ id: workflowId });
  }

  async getRules(userId: string): Promise<ApprovalRulesResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rules = await this.ruleRepository.find({
      where: { companyId: user.companyId },
      relations: ['creator'],
      order: { priority: 'DESC', createdAt: 'DESC' }
    });

    return {
      rules,
      totalCount: rules.length
    };
  }

  async createRule(request: CreateApprovalRuleRequest, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (user.role !== 'Admin' && user.role !== 'Editor') {
      throw new ForbiddenException('Only Admins and Editors can create approval rules');
    }

    const rule = this.ruleRepository.create({
      name: request.name,
      description: request.description,
      companyId: user.companyId,
      entityType: request.entityType,
      conditions: request.conditions,
      steps: request.steps,
      priority: request.priority || 1,
      createdBy: userId,
      isActive: true
    });

    await this.ruleRepository.save(rule);
  }

  async updateRule(request: UpdateApprovalRuleRequest, userId: string): Promise<void> {
    const rule = await this.ruleRepository.findOne({
      where: { id: request.id }
    });

    if (!rule) {
      throw new NotFoundException('Rule not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (user.role !== 'Admin' && user.role !== 'Editor') {
      throw new ForbiddenException('Only Admins and Editors can update approval rules');
    }

    await this.ruleRepository.update(
      { id: request.id },
      {
        name: request.name,
        description: request.description,
        conditions: request.conditions,
        steps: request.steps,
        isActive: request.isActive,
        priority: request.priority
      }
    );
  }

  async deleteRule(ruleId: string, userId: string): Promise<void> {
    const rule = await this.ruleRepository.findOne({
      where: { id: ruleId }
    });

    if (!rule) {
      throw new NotFoundException('Rule not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (user.role !== 'Admin' && user.role !== 'Editor') {
      throw new ForbiddenException('Only Admins and Editors can delete approval rules');
    }

    await this.ruleRepository.delete({ id: ruleId });
  }

  async getTemplates(entityType: string | undefined, userId: string): Promise<ApprovalTemplatesResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const whereConditions: any = { companyId: user.companyId };
    if (entityType) {
      whereConditions.entityType = entityType;
    }

    const templates = await this.templateRepository.find({
      where: whereConditions,
      relations: ['creator'],
      order: { isDefault: 'DESC', timesUsed: 'DESC', createdAt: 'DESC' }
    });

    return {
      templates,
      totalCount: templates.length
    };
  }

  async createTemplate(request: CreateApprovalTemplateRequest, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (user.role !== 'Admin' && user.role !== 'Editor') {
      throw new ForbiddenException('Only Admins and Editors can create approval templates');
    }

    // If setting as default, unset other defaults for this entity type
    if (request.isDefault) {
      await this.templateRepository.update(
        { companyId: user.companyId, entityType: request.entityType },
        { isDefault: false }
      );
    }

    const template = this.templateRepository.create({
      name: request.name,
      description: request.description,
      entityType: request.entityType,
      companyId: user.companyId,
      steps: request.steps,
      defaultPriority: request.defaultPriority || 'medium',
      defaultDueDate: request.defaultDueDate,
      isDefault: request.isDefault || false,
      createdBy: userId,
      timesUsed: 0
    });

    await this.templateRepository.save(template);
  }

  async updateTemplate(request: any, userId: string): Promise<void> {
    const template = await this.templateRepository.findOne({
      where: { id: request.id }
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (user.role !== 'Admin' && user.role !== 'Editor') {
      throw new ForbiddenException('Only Admins and Editors can update approval templates');
    }

    // If setting as default, unset other defaults for this entity type
    if (request.isDefault && !template.isDefault) {
      await this.templateRepository.update(
        { companyId: user.companyId, entityType: template.entityType },
        { isDefault: false }
      );
    }

    await this.templateRepository.update(
      { id: request.id },
      {
        name: request.name,
        description: request.description,
        steps: request.steps,
        defaultPriority: request.defaultPriority,
        defaultDueDate: request.defaultDueDate,
        isDefault: request.isDefault
      }
    );
  }

  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId }
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (user.role !== 'Admin' && user.role !== 'Editor') {
      throw new ForbiddenException('Only Admins and Editors can delete approval templates');
    }

    await this.templateRepository.delete({ id: templateId });
  }
}