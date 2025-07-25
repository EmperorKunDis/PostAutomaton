import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApprovalWorkflowsService } from './approval-workflows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
  ApprovalWorkflow,
  ApprovalDecision
} from '@internal-marketing-content-app/shared';

@Controller('approval-workflows')
@UseGuards(JwtAuthGuard)
export class ApprovalWorkflowsController {
  constructor(private readonly workflowsService: ApprovalWorkflowsService) {}

  @Post()
  async createWorkflow(
    @Body() request: CreateApprovalWorkflowRequest,
    @Request() req: any
  ): Promise<ApprovalWorkflow> {
    return this.workflowsService.createWorkflow(request, req.user.id);
  }

  @Put(':id')
  async updateWorkflow(
    @Param('id') workflowId: string,
    @Body() request: Omit<UpdateApprovalWorkflowRequest, 'id'>,
    @Request() req: any
  ): Promise<ApprovalWorkflow> {
    return this.workflowsService.updateWorkflow(
      { ...request, id: workflowId },
      req.user.id
    );
  }

  @Post(':id/submit')
  async submitForApproval(
    @Param('id') workflowId: string,
    @Body() request: Omit<SubmitForApprovalRequest, 'workflowId'>,
    @Request() req: any
  ): Promise<ApprovalWorkflow> {
    return this.workflowsService.submitForApproval(
      { ...request, workflowId },
      req.user.id
    );
  }

  @Post(':id/decision')
  async makeDecision(
    @Param('id') workflowId: string,
    @Body() request: Omit<MakeApprovalDecisionRequest, 'workflowId'>,
    @Request() req: any
  ): Promise<ApprovalDecision> {
    return this.workflowsService.makeDecision(
      { ...request, workflowId },
      req.user.id
    );
  }

  @Post('bulk-approval')
  async bulkApproval(
    @Body() request: BulkApprovalRequest,
    @Request() req: any
  ): Promise<{ success: boolean }> {
    await this.workflowsService.bulkApproval(request, req.user.id);
    return { success: true };
  }

  @Get()
  async getWorkflows(
    @Query('status') status?: string,
    @Query('entityType') entityType?: string,
    @Query('assignedToMe') assignedToMe?: boolean,
    @Query('authoredByMe') authoredByMe?: boolean,
    @Query('priority') priority?: string,
    @Query('dueDateFrom') dueDateFrom?: string,
    @Query('dueDateTo') dueDateTo?: string,
    @Query('sortField') sortField?: string,
    @Query('sortDirection') sortDirection?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Request() req: any
  ): Promise<ApprovalWorkflowsResponse> {
    const request: ApprovalWorkflowsRequest = {
      status: status as any,
      entityType: entityType as any,
      assignedToMe: assignedToMe === 'true',
      authoredByMe: authoredByMe === 'true',
      priority: priority as any,
      dueDate: dueDateFrom || dueDateTo ? {
        from: dueDateFrom ? new Date(dueDateFrom) : undefined,
        to: dueDateTo ? new Date(dueDateTo) : undefined
      } : undefined,
      sort: sortField ? {
        field: sortField as any,
        direction: (sortDirection as any) || 'desc'
      } : undefined,
      pagination: page || limit ? {
        page: page || 1,
        limit: limit || 50
      } : undefined
    };

    return this.workflowsService.getWorkflows(request, req.user.id);
  }

  @Get('dashboard/stats')
  async getDashboardStats(
    @Request() req: any
  ): Promise<ApprovalDashboardStats> {
    return this.workflowsService.getDashboardStats(req.user.id);
  }

  @Get(':id')
  async getWorkflowDetails(
    @Param('id') workflowId: string,
    @Request() req: any
  ): Promise<ApprovalWorkflowDetailsResponse> {
    return this.workflowsService.getWorkflowDetails(workflowId, req.user.id);
  }

  @Delete(':id')
  async deleteWorkflow(
    @Param('id') workflowId: string,
    @Request() req: any
  ): Promise<{ success: boolean }> {
    await this.workflowsService.deleteWorkflow(workflowId, req.user.id);
    return { success: true };
  }

  // Approval Rules endpoints
  @Get('rules/list')
  async getRules(
    @Request() req: any
  ): Promise<ApprovalRulesResponse> {
    return this.workflowsService.getRules(req.user.id);
  }

  @Post('rules')
  async createRule(
    @Body() request: CreateApprovalRuleRequest,
    @Request() req: any
  ): Promise<{ success: boolean }> {
    await this.workflowsService.createRule(request, req.user.id);
    return { success: true };
  }

  @Put('rules/:id')
  async updateRule(
    @Param('id') ruleId: string,
    @Body() request: Omit<UpdateApprovalRuleRequest, 'id'>,
    @Request() req: any
  ): Promise<{ success: boolean }> {
    await this.workflowsService.updateRule(
      { ...request, id: ruleId },
      req.user.id
    );
    return { success: true };
  }

  @Delete('rules/:id')
  async deleteRule(
    @Param('id') ruleId: string,
    @Request() req: any
  ): Promise<{ success: boolean }> {
    await this.workflowsService.deleteRule(ruleId, req.user.id);
    return { success: true };
  }

  // Approval Templates endpoints
  @Get('templates/list')
  async getTemplates(
    @Query('entityType') entityType?: string,
    @Request() req: any
  ): Promise<ApprovalTemplatesResponse> {
    return this.workflowsService.getTemplates(entityType as any, req.user.id);
  }

  @Post('templates')
  async createTemplate(
    @Body() request: CreateApprovalTemplateRequest,
    @Request() req: any
  ): Promise<{ success: boolean }> {
    await this.workflowsService.createTemplate(request, req.user.id);
    return { success: true };
  }

  @Put('templates/:id')
  async updateTemplate(
    @Param('id') templateId: string,
    @Body() request: any,
    @Request() req: any
  ): Promise<{ success: boolean }> {
    await this.workflowsService.updateTemplate(
      { ...request, id: templateId },
      req.user.id
    );
    return { success: true };
  }

  @Delete('templates/:id')
  async deleteTemplate(
    @Param('id') templateId: string,
    @Request() req: any
  ): Promise<{ success: boolean }> {
    await this.workflowsService.deleteTemplate(templateId, req.user.id);
    return { success: true };
  }
}