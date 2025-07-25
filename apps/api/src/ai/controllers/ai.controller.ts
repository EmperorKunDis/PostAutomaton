import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { AIModelService } from '../services/ai-model.service';
import { TrainingPipelineService } from '../services/training-pipeline.service';
import { ContentOptimizationService } from '../services/content-optimization.service';
import { 
  User,
  CreateAIModelRequest,
  UpdateAIModelRequest,
  DeployModelRequest,
  ModelPredictionRequest,
  CreateTrainingPipelineRequest,
  UpdateTrainingPipelineRequest,
  RunPipelineRequest,
  CreateDatasetRequest,
  CreateFeatureRequest,
  OptimizeContentRequest,
  CreateOptimizationRuleRequest,
  ModelType,
  DeploymentEnvironment,
  DatasetType,
  FeatureType,
  OptimizationCategory,
  ContentAnalyticsEntityType,
  SuggestionStatus
} from '@internal-marketing-content-app/shared';

@Controller('ai')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AIController {
  constructor(
    private aiModelService: AIModelService,
    private trainingPipelineService: TrainingPipelineService,
    private contentOptimizationService: ContentOptimizationService,
  ) {}

  // AI Model Management
  @Post('models')
  @RequirePermissions('ai:create')
  async createModel(
    @Body() request: CreateAIModelRequest,
    @GetUser() user: User
  ) {
    return this.aiModelService.createModel({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Get('models')
  @RequirePermissions('ai:read')
  async getModels(
    @Query('type') modelType?: ModelType,
    @GetUser() user: User
  ) {
    return this.aiModelService.getModels(user.companyId, modelType);
  }

  @Get('models/:id')
  @RequirePermissions('ai:read')
  async getModel(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return this.aiModelService.getModel(id, user.companyId);
  }

  @Put('models/:id')
  @RequirePermissions('ai:update')
  async updateModel(
    @Param('id') id: string,
    @Body() request: UpdateAIModelRequest,
    @GetUser() user: User
  ) {
    return this.aiModelService.updateModel(id, user.companyId, request);
  }

  @Delete('models/:id')
  @RequirePermissions('ai:delete')
  async deleteModel(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    await this.aiModelService.deleteModel(id, user.companyId);
    return { success: true };
  }

  @Post('models/:id/versions')
  @RequirePermissions('ai:create')
  async createModelVersion(
    @Param('id') modelId: string,
    @Body() versionData: {
      version: string;
      description?: string;
      modelArtifactUrl: string;
      metrics?: any;
      trainingMetadata?: Record<string, any>;
    },
    @GetUser() user: User
  ) {
    return this.aiModelService.createVersion(modelId, user.companyId, versionData);
  }

  @Get('models/:id/versions')
  @RequirePermissions('ai:read')
  async getModelVersions(
    @Param('id') modelId: string,
    @GetUser() user: User
  ) {
    return this.aiModelService.getVersions(modelId, user.companyId);
  }

  @Post('models/deploy')
  @RequirePermissions('ai:deploy')
  async deployModel(
    @Body() request: DeployModelRequest,
    @GetUser() user: User
  ) {
    return this.aiModelService.deployModel({
      ...request,
      companyId: user.companyId,
    });
  }

  @Get('deployments')
  @RequirePermissions('ai:read')
  async getDeployments(
    @Query('environment') environment?: DeploymentEnvironment,
    @GetUser() user: User
  ) {
    return this.aiModelService.getDeployments(user.companyId, environment);
  }

  @Delete('deployments/:id')
  @RequirePermissions('ai:deploy')
  async undeployModel(
    @Param('id') deploymentId: string,
    @GetUser() user: User
  ) {
    return this.aiModelService.undeployModel(deploymentId, user.companyId);
  }

  @Post('predict')
  @RequirePermissions('ai:predict')
  async makePrediction(
    @Body() request: ModelPredictionRequest,
    @GetUser() user: User
  ) {
    return this.aiModelService.makePrediction({
      ...request,
      companyId: user.companyId,
    });
  }

  @Get('models/:id/metrics')
  @RequirePermissions('ai:read')
  async getModelMetrics(
    @Param('id') modelId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @GetUser() user: User
  ) {
    const dateRange = startDate && endDate ? {
      start: new Date(startDate),
      end: new Date(endDate),
    } : undefined;

    return this.aiModelService.getModelMetrics(modelId, user.companyId, dateRange);
  }

  @Post('models/:id/optimize')
  @RequirePermissions('ai:update')
  async optimizeModel(
    @Param('id') modelId: string,
    @Body() optimizationConfig: {
      target: 'accuracy' | 'speed' | 'cost';
      constraints?: Record<string, any>;
    },
    @GetUser() user: User
  ) {
    return this.aiModelService.optimizeModel(modelId, user.companyId, optimizationConfig);
  }

  // Training Pipeline Management
  @Post('pipelines')
  @RequirePermissions('ai:create')
  async createPipeline(
    @Body() request: CreateTrainingPipelineRequest,
    @GetUser() user: User
  ) {
    return this.trainingPipelineService.createPipeline({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Get('pipelines')
  @RequirePermissions('ai:read')
  async getPipelines(
    @GetUser() user: User
  ) {
    return this.trainingPipelineService.getPipelines(user.companyId);
  }

  @Get('pipelines/:id')
  @RequirePermissions('ai:read')
  async getPipeline(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return this.trainingPipelineService.getPipeline(id, user.companyId);
  }

  @Put('pipelines/:id')
  @RequirePermissions('ai:update')
  async updatePipeline(
    @Param('id') id: string,
    @Body() request: UpdateTrainingPipelineRequest,
    @GetUser() user: User
  ) {
    return this.trainingPipelineService.updatePipeline(id, user.companyId, request);
  }

  @Post('pipelines/:id/run')
  @RequirePermissions('ai:execute')
  async runPipeline(
    @Param('id') pipelineId: string,
    @Body() request: Omit<RunPipelineRequest, 'pipelineId' | 'companyId'>,
    @GetUser() user: User
  ) {
    return this.trainingPipelineService.runPipeline({
      ...request,
      pipelineId,
      companyId: user.companyId,
    });
  }

  @Get('pipelines/:id/runs')
  @RequirePermissions('ai:read')
  async getPipelineRuns(
    @Param('id') pipelineId: string,
    @GetUser() user: User
  ) {
    return this.trainingPipelineService.getPipelineRuns(pipelineId, user.companyId);
  }

  @Get('pipeline-runs/:id')
  @RequirePermissions('ai:read')
  async getPipelineRun(
    @Param('id') runId: string,
    @GetUser() user: User
  ) {
    return this.trainingPipelineService.getPipelineRun(runId, user.companyId);
  }

  @Post('pipeline-runs/:id/stop')
  @RequirePermissions('ai:execute')
  async stopPipelineRun(
    @Param('id') runId: string,
    @GetUser() user: User
  ) {
    return this.trainingPipelineService.stopPipelineRun(runId, user.companyId);
  }

  @Get('pipelines/:id/metrics')
  @RequirePermissions('ai:read')
  async getTrainingMetrics(
    @Param('id') pipelineId: string,
    @Query('runId') runId?: string,
    @GetUser() user: User
  ) {
    return this.trainingPipelineService.getTrainingMetrics(pipelineId, user.companyId, runId);
  }

  // Dataset Management
  @Post('datasets')
  @RequirePermissions('ai:create')
  async createDataset(
    @Body() request: CreateDatasetRequest,
    @GetUser() user: User
  ) {
    return this.trainingPipelineService.createDataset({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Get('datasets')
  @RequirePermissions('ai:read')
  async getDatasets(
    @Query('type') datasetType?: DatasetType,
    @GetUser() user: User
  ) {
    return this.trainingPipelineService.getDatasets(user.companyId, datasetType);
  }

  // Feature Store Management
  @Post('features')
  @RequirePermissions('ai:create')
  async createFeature(
    @Body() request: CreateFeatureRequest,
    @GetUser() user: User
  ) {
    return this.trainingPipelineService.createFeature({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Get('features')
  @RequirePermissions('ai:read')
  async getFeatures(
    @Query('type') featureType?: FeatureType,
    @GetUser() user: User
  ) {
    return this.trainingPipelineService.getFeatures(user.companyId, featureType);
  }

  // Content Optimization
  @Post('optimize')
  @RequirePermissions('content:optimize')
  async optimizeContent(
    @Body() request: OptimizeContentRequest,
    @GetUser() user: User
  ) {
    return this.contentOptimizationService.optimizeContent({
      ...request,
      companyId: user.companyId,
    });
  }

  @Get('optimization-suggestions')
  @RequirePermissions('content:read')
  async getOptimizationSuggestions(
    @Query('entityType') entityType?: ContentAnalyticsEntityType,
    @Query('entityId') entityId?: string,
    @Query('status') status?: SuggestionStatus,
    @GetUser() user: User
  ) {
    return this.contentOptimizationService.getSuggestions(
      user.companyId,
      entityType,
      entityId,
      status
    );
  }

  @Put('optimization-suggestions/:id')
  @RequirePermissions('content:update')
  async updateSuggestionStatus(
    @Param('id') suggestionId: string,
    @Body() request: { status: SuggestionStatus; feedback?: string },
    @GetUser() user: User
  ) {
    return this.contentOptimizationService.updateSuggestionStatus(
      suggestionId,
      user.companyId,
      request.status,
      request.feedback
    );
  }

  @Get('bulk-optimization')
  @RequirePermissions('content:read')
  async getBulkOptimizationSuggestions(
    @Query('entityType') entityType: ContentAnalyticsEntityType,
    @Query('limit') limit?: string,
    @GetUser() user: User
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.contentOptimizationService.getBulkOptimizationSuggestions(
      user.companyId,
      entityType,
      limitNum
    );
  }

  // Optimization Rules Management
  @Post('optimization-rules')
  @RequirePermissions('ai:create')
  async createOptimizationRule(
    @Body() request: CreateOptimizationRuleRequest,
    @GetUser() user: User
  ) {
    return this.contentOptimizationService.createOptimizationRule({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Get('optimization-rules')
  @RequirePermissions('ai:read')
  async getOptimizationRules(
    @Query('category') category?: OptimizationCategory,
    @GetUser() user: User
  ) {
    return this.contentOptimizationService.getOptimizationRules(user.companyId, category);
  }

  // AI Dashboard and Analytics
  @Get('dashboard')
  @RequirePermissions('ai:read')
  async getAIDashboard(
    @GetUser() user: User
  ) {
    const [models, pipelines, deployments, suggestions] = await Promise.all([
      this.aiModelService.getModels(user.companyId),
      this.trainingPipelineService.getPipelines(user.companyId),
      this.aiModelService.getDeployments(user.companyId),
      this.contentOptimizationService.getSuggestions(user.companyId),
    ]);

    const activeModels = models.filter(m => m.status === 'trained').length;
    const runningPipelines = pipelines.filter(p => p.status === 'running').length;
    const activeDeployments = deployments.filter(d => d.status === 'active').length;
    const pendingSuggestions = suggestions.filter(s => s.status === 'pending').length;

    return {
      summary: {
        totalModels: models.length,
        activeModels,
        runningPipelines,
        activeDeployments,
        pendingSuggestions,
      },
      recentModels: models.slice(0, 5),
      recentPipelines: pipelines.slice(0, 5),
      recentDeployments: deployments.slice(0, 5),
      topSuggestions: suggestions.slice(0, 10),
    };
  }

  @Get('health')
  @RequirePermissions('ai:read')
  async getAISystemHealth(
    @GetUser() user: User
  ) {
    const [deployments, pipelines] = await Promise.all([
      this.aiModelService.getDeployments(user.companyId),
      this.trainingPipelineService.getPipelines(user.companyId),
    ]);

    const totalDeployments = deployments.length;
    const healthyDeployments = deployments.filter(d => d.status === 'active').length;
    const failedDeployments = deployments.filter(d => d.status === 'failed').length;

    const totalPipelines = pipelines.length;
    const successfulPipelines = pipelines.filter(p => p.status === 'completed').length;
    const failedPipelines = pipelines.filter(p => p.status === 'failed').length;

    const systemHealth = {
      overall: 'healthy' as 'healthy' | 'warning' | 'critical',
      deploymentHealth: totalDeployments > 0 ? (healthyDeployments / totalDeployments) * 100 : 100,
      pipelineHealth: totalPipelines > 0 ? (successfulPipelines / totalPipelines) * 100 : 100,
      issues: [] as string[],
    };

    if (systemHealth.deploymentHealth < 80) {
      systemHealth.overall = 'warning';
      systemHealth.issues.push(`${failedDeployments} deployments are failing`);
    }

    if (systemHealth.pipelineHealth < 70) {
      systemHealth.overall = systemHealth.overall === 'warning' ? 'critical' : 'warning';
      systemHealth.issues.push(`${failedPipelines} pipelines have failed recently`);
    }

    if (systemHealth.deploymentHealth < 50 || systemHealth.pipelineHealth < 50) {
      systemHealth.overall = 'critical';
    }

    return {
      ...systemHealth,
      lastChecked: new Date(),
      metrics: {
        totalDeployments,
        healthyDeployments,
        failedDeployments,
        totalPipelines,
        successfulPipelines,
        failedPipelines,
      },
    };
  }
}