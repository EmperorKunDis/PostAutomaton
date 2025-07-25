import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingPipeline } from '../../database/entities/training-pipeline.entity';
import { PipelineRun } from '../../database/entities/pipeline-run.entity';
import { TrainingDataset } from '../../database/entities/training-dataset.entity';
import { FeatureStore } from '../../database/entities/feature-store.entity';
import { AIModelService } from './ai-model.service';
import { 
  CreateTrainingPipelineRequest,
  UpdateTrainingPipelineRequest,
  RunPipelineRequest,
  PipelineStatus,
  DatasetType,
  FeatureType,
  TrainingMetrics,
  PipelineStage,
  CreateDatasetRequest,
  CreateFeatureRequest
} from '@internal-marketing-content-app/shared';

@Injectable()
export class TrainingPipelineService {
  constructor(
    @InjectRepository(TrainingPipeline)
    private pipelineRepository: Repository<TrainingPipeline>,
    
    @InjectRepository(PipelineRun)
    private pipelineRunRepository: Repository<PipelineRun>,
    
    @InjectRepository(TrainingDataset)
    private datasetRepository: Repository<TrainingDataset>,
    
    @InjectRepository(FeatureStore)
    private featureStoreRepository: Repository<FeatureStore>,
    
    private aiModelService: AIModelService,
  ) {}

  async createPipeline(request: CreateTrainingPipelineRequest): Promise<TrainingPipeline> {
    const pipeline = this.pipelineRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      name: request.name,
      description: request.description,
      modelType: request.modelType,
      status: 'draft',
      stages: request.stages || [
        { name: 'data_ingestion', order: 1, configuration: {} },
        { name: 'data_preprocessing', order: 2, configuration: {} },
        { name: 'feature_engineering', order: 3, configuration: {} },
        { name: 'model_training', order: 4, configuration: {} },
        { name: 'model_validation', order: 5, configuration: {} },
        { name: 'model_deployment', order: 6, configuration: {} },
      ],
      dataSource: request.dataSource,
      featureConfig: request.featureConfig || {},
      trainingConfig: request.trainingConfig || {},
      validationConfig: request.validationConfig || {},
      deploymentConfig: request.deploymentConfig || {},
      schedule: request.schedule,
      isActive: true,
    });

    return this.pipelineRepository.save(pipeline);
  }

  async getPipelines(companyId: string): Promise<TrainingPipeline[]> {
    return this.pipelineRepository.find({
      where: { companyId },
      relations: ['runs'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPipeline(id: string, companyId: string): Promise<TrainingPipeline> {
    const pipeline = await this.pipelineRepository.findOne({
      where: { id, companyId },
      relations: ['runs'],
    });

    if (!pipeline) {
      throw new Error('Training pipeline not found');
    }

    return pipeline;
  }

  async updatePipeline(
    id: string,
    companyId: string,
    request: UpdateTrainingPipelineRequest
  ): Promise<TrainingPipeline> {
    const pipeline = await this.getPipeline(id, companyId);

    if (pipeline.status === 'running') {
      throw new Error('Cannot update running pipeline');
    }

    Object.assign(pipeline, {
      name: request.name ?? pipeline.name,
      description: request.description ?? pipeline.description,
      stages: request.stages ?? pipeline.stages,
      dataSource: request.dataSource ?? pipeline.dataSource,
      featureConfig: request.featureConfig ?? pipeline.featureConfig,
      trainingConfig: request.trainingConfig ?? pipeline.trainingConfig,
      validationConfig: request.validationConfig ?? pipeline.validationConfig,
      deploymentConfig: request.deploymentConfig ?? pipeline.deploymentConfig,
      schedule: request.schedule ?? pipeline.schedule,
      isActive: request.isActive ?? pipeline.isActive,
    });

    return this.pipelineRepository.save(pipeline);
  }

  async runPipeline(request: RunPipelineRequest): Promise<PipelineRun> {
    const pipeline = await this.getPipeline(request.pipelineId, request.companyId);

    if (!pipeline.isActive) {
      throw new Error('Cannot run inactive pipeline');
    }

    // Check if pipeline is already running
    const runningRun = await this.pipelineRunRepository.findOne({
      where: { pipelineId: request.pipelineId, status: 'running' },
    });

    if (runningRun) {
      throw new Error('Pipeline is already running');
    }

    const run = this.pipelineRunRepository.create({
      pipelineId: request.pipelineId,
      companyId: request.companyId,
      triggeredBy: request.triggeredBy || 'manual',
      runType: request.runType || 'full',
      parameters: request.parameters || {},
      status: 'running',
      startedAt: new Date(),
      currentStage: pipeline.stages[0]?.name || 'unknown',
      stageProgress: {},
      logs: [],
    });

    const savedRun = await this.pipelineRunRepository.save(run);

    // Update pipeline status
    pipeline.status = 'running';
    pipeline.lastRunAt = new Date();
    await this.pipelineRepository.save(pipeline);

    // Execute pipeline asynchronously
    this.executePipeline(pipeline, savedRun).catch(error => {
      console.error(`Pipeline execution failed for ${savedRun.id}:`, error);
    });

    return savedRun;
  }

  async getPipelineRuns(pipelineId: string, companyId: string): Promise<PipelineRun[]> {
    // Verify pipeline access
    await this.getPipeline(pipelineId, companyId);

    return this.pipelineRunRepository.find({
      where: { pipelineId },
      order: { startedAt: 'DESC' },
      take: 50,
    });
  }

  async getPipelineRun(runId: string, companyId: string): Promise<PipelineRun> {
    const run = await this.pipelineRunRepository.findOne({
      where: { id: runId, companyId },
      relations: ['pipeline'],
    });

    if (!run) {
      throw new Error('Pipeline run not found');
    }

    return run;
  }

  async stopPipelineRun(runId: string, companyId: string): Promise<PipelineRun> {
    const run = await this.getPipelineRun(runId, companyId);

    if (run.status !== 'running') {
      throw new Error('Pipeline run is not running');
    }

    run.status = 'cancelled';
    run.completedAt = new Date();
    run.duration = Math.floor((run.completedAt.getTime() - run.startedAt.getTime()) / 1000);
    run.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Pipeline run cancelled by user',
      stage: run.currentStage,
    });

    const savedRun = await this.pipelineRunRepository.save(run);

    // Update pipeline status
    const pipeline = await this.pipelineRepository.findOne({
      where: { id: run.pipelineId },
    });

    if (pipeline) {
      pipeline.status = 'idle';
      await this.pipelineRepository.save(pipeline);
    }

    return savedRun;
  }

  async createDataset(request: CreateDatasetRequest): Promise<TrainingDataset> {
    const dataset = this.datasetRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      name: request.name,
      description: request.description,
      datasetType: request.datasetType,
      source: request.source,
      format: request.format,
      schema: request.schema || {},
      statistics: {},
      status: 'processing',
      storageLocation: this.generateStorageLocation(request.name, request.companyId),
      isActive: true,
    });

    const savedDataset = await this.datasetRepository.save(dataset);

    // Process dataset asynchronously
    this.processDataset(savedDataset).catch(error => {
      console.error(`Dataset processing failed for ${savedDataset.id}:`, error);
    });

    return savedDataset;
  }

  async getDatasets(companyId: string, datasetType?: DatasetType): Promise<TrainingDataset[]> {
    const query = this.datasetRepository.createQueryBuilder('dataset')
      .where('dataset.companyId = :companyId', { companyId })
      .orderBy('dataset.createdAt', 'DESC');

    if (datasetType) {
      query.andWhere('dataset.datasetType = :datasetType', { datasetType });
    }

    return query.getMany();
  }

  async createFeature(request: CreateFeatureRequest): Promise<FeatureStore> {
    const feature = this.featureStoreRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      name: request.name,
      description: request.description,
      featureType: request.featureType,
      dataType: request.dataType,
      transformationLogic: request.transformationLogic,
      validationRules: request.validationRules || {},
      metadata: request.metadata || {},
      version: '1.0.0',
      isActive: true,
    });

    return this.featureStoreRepository.save(feature);
  }

  async getFeatures(companyId: string, featureType?: FeatureType): Promise<FeatureStore[]> {
    const query = this.featureStoreRepository.createQueryBuilder('feature')
      .where('feature.companyId = :companyId', { companyId })
      .orderBy('feature.createdAt', 'DESC');

    if (featureType) {
      query.andWhere('feature.featureType = :featureType', { featureType });
    }

    return query.getMany();
  }

  async getTrainingMetrics(
    pipelineId: string,
    companyId: string,
    runId?: string
  ): Promise<TrainingMetrics> {
    // Verify pipeline access
    await this.getPipeline(pipelineId, companyId);

    let run: PipelineRun;
    if (runId) {
      run = await this.getPipelineRun(runId, companyId);
    } else {
      // Get the latest successful run
      run = await this.pipelineRunRepository.findOne({
        where: { pipelineId, status: 'completed' },
        order: { completedAt: 'DESC' },
      });
    }

    if (!run || !run.metrics) {
      throw new Error('No training metrics available');
    }

    return run.metrics;
  }

  private async executePipeline(pipeline: TrainingPipeline, run: PipelineRun): Promise<void> {
    try {
      for (const stage of pipeline.stages.sort((a, b) => a.order - b.order)) {
        await this.executeStage(pipeline, run, stage);
        
        if (run.status === 'cancelled') {
          return;
        }
      }

      // Pipeline completed successfully
      run.status = 'completed';
      run.completedAt = new Date();
      run.duration = Math.floor((run.completedAt.getTime() - run.startedAt.getTime()) / 1000);
      run.logs.push({
        timestamp: new Date(),
        level: 'info',
        message: 'Pipeline completed successfully',
        stage: 'completion',
      });

      await this.pipelineRunRepository.save(run);

      // Update pipeline status
      pipeline.status = 'completed';
      pipeline.lastSuccessfulRunAt = new Date();
      await this.pipelineRepository.save(pipeline);

      // If auto-deployment is configured, deploy the model
      if (pipeline.deploymentConfig.autoDeploy) {
        await this.autoDeployModel(pipeline, run);
      }

    } catch (error) {
      run.status = 'failed';
      run.completedAt = new Date();
      run.duration = Math.floor((run.completedAt.getTime() - run.startedAt.getTime()) / 1000);
      run.error = error.message;
      run.logs.push({
        timestamp: new Date(),
        level: 'error',
        message: `Pipeline failed: ${error.message}`,
        stage: run.currentStage,
      });

      await this.pipelineRunRepository.save(run);

      // Update pipeline status
      pipeline.status = 'failed';
      pipeline.lastError = error.message;
      await this.pipelineRepository.save(pipeline);

      throw error;
    }
  }

  private async executeStage(pipeline: TrainingPipeline, run: PipelineRun, stage: PipelineStage): Promise<void> {
    run.currentStage = stage.name;
    run.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Starting stage: ${stage.name}`,
      stage: stage.name,
    });

    await this.pipelineRunRepository.save(run);

    // Simulate stage execution time
    const executionTime = 5000 + Math.random() * 10000; // 5-15 seconds
    await new Promise(resolve => setTimeout(resolve, executionTime));

    // Update stage progress
    run.stageProgress[stage.name] = {
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      duration: Math.floor(executionTime / 1000),
      metrics: this.generateStageMetrics(stage.name),
    };

    // Add stage-specific metrics to run
    if (stage.name === 'model_training') {
      run.metrics = this.generateTrainingMetrics();
    }

    run.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Completed stage: ${stage.name}`,
      stage: stage.name,
    });

    await this.pipelineRunRepository.save(run);
  }

  private generateStageMetrics(stageName: string): Record<string, any> {
    switch (stageName) {
      case 'data_ingestion':
        return {
          recordsIngested: Math.floor(Math.random() * 10000) + 1000,
          dataSize: Math.floor(Math.random() * 500) + 100, // MB
          processingTime: Math.floor(Math.random() * 60) + 30, // seconds
        };
        
      case 'data_preprocessing':
        return {
          recordsCleaned: Math.floor(Math.random() * 9000) + 900,
          duplicatesRemoved: Math.floor(Math.random() * 100) + 10,
          missingValuesHandled: Math.floor(Math.random() * 200) + 50,
        };
        
      case 'feature_engineering':
        return {
          featuresGenerated: Math.floor(Math.random() * 50) + 20,
          featureImportanceCalculated: true,
          correlationAnalysisCompleted: true,
        };
        
      case 'model_training':
        return {
          epochs: Math.floor(Math.random() * 50) + 10,
          finalLoss: 0.1 + Math.random() * 0.3,
          trainingAccuracy: 0.8 + Math.random() * 0.15,
          validationAccuracy: 0.75 + Math.random() * 0.15,
        };
        
      case 'model_validation':
        return {
          testAccuracy: 0.8 + Math.random() * 0.1,
          precision: 0.75 + Math.random() * 0.2,
          recall: 0.7 + Math.random() * 0.25,
          f1Score: 0.72 + Math.random() * 0.23,
        };
        
      default:
        return {};
    }
  }

  private generateTrainingMetrics(): TrainingMetrics {
    return {
      accuracy: 0.85 + Math.random() * 0.1,
      precision: 0.82 + Math.random() * 0.15,
      recall: 0.78 + Math.random() * 0.2,
      f1Score: 0.8 + Math.random() * 0.15,
      loss: 0.1 + Math.random() * 0.2,
      trainingTime: Math.floor(Math.random() * 3600) + 600, // 10-60 minutes
      epochs: Math.floor(Math.random() * 50) + 10,
      learningRate: 0.001 + Math.random() * 0.009,
      batchSize: [16, 32, 64, 128][Math.floor(Math.random() * 4)],
      validationLoss: 0.12 + Math.random() * 0.25,
      confusionMatrix: this.generateConfusionMatrix(),
      featureImportance: this.generateFeatureImportance(),
    };
  }

  private generateConfusionMatrix(): number[][] {
    // Generate a 3x3 confusion matrix for demo
    return [
      [85, 8, 7],
      [12, 78, 10],
      [5, 9, 86],
    ];
  }

  private generateFeatureImportance(): Record<string, number> {
    const features = ['content_length', 'keyword_density', 'readability_score', 'sentiment_score', 'topic_relevance'];
    const importance: Record<string, number> = {};
    
    for (const feature of features) {
      importance[feature] = Math.random();
    }
    
    return importance;
  }

  private async processDataset(dataset: TrainingDataset): Promise<void> {
    try {
      // Simulate dataset processing
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));

      // Generate dataset statistics
      const statistics = {
        recordCount: Math.floor(Math.random() * 10000) + 1000,
        columnCount: Math.floor(Math.random() * 20) + 5,
        missingValues: Math.floor(Math.random() * 100),
        duplicates: Math.floor(Math.random() * 50),
        dataTypes: {
          numeric: Math.floor(Math.random() * 10) + 2,
          categorical: Math.floor(Math.random() * 8) + 1,
          text: Math.floor(Math.random() * 5) + 1,
          datetime: Math.floor(Math.random() * 3),
        },
      };

      dataset.statistics = statistics;
      dataset.status = 'ready';
      dataset.processedAt = new Date();

      await this.datasetRepository.save(dataset);

    } catch (error) {
      dataset.status = 'error';
      dataset.error = error.message;
      await this.datasetRepository.save(dataset);
    }
  }

  private async autoDeployModel(pipeline: TrainingPipeline, run: PipelineRun): Promise<void> {
    try {
      // Create a new model if it doesn't exist
      const models = await this.aiModelService.getModels(pipeline.companyId, pipeline.modelType);
      let model = models.find(m => m.name === `${pipeline.name}_model`);

      if (!model) {
        model = await this.aiModelService.createModel({
          companyId: pipeline.companyId,
          userId: pipeline.userId,
          name: `${pipeline.name}_model`,
          description: `Auto-generated model from pipeline: ${pipeline.name}`,
          modelType: pipeline.modelType,
          configuration: pipeline.trainingConfig,
        });
      }

      // Create a new version
      const version = await this.aiModelService.createVersion(model.id, pipeline.companyId, {
        version: `v${Date.now()}`,
        description: `Auto-generated from pipeline run ${run.id}`,
        modelArtifactUrl: `${pipeline.deploymentConfig.storageLocation}/model_${run.id}.pkl`,
        metrics: run.metrics,
        trainingMetadata: {
          pipelineId: pipeline.id,
          runId: run.id,
          trainingDate: new Date(),
        },
      });

      // Deploy to specified environment
      await this.aiModelService.deployModel({
        modelId: model.id,
        versionId: version.id,
        companyId: pipeline.companyId,
        environment: pipeline.deploymentConfig.environment || 'staging',
        deploymentName: `${pipeline.name}_auto_deployment`,
        configuration: pipeline.deploymentConfig.modelConfig || {},
        replaceExisting: true,
      });

      run.logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `Model auto-deployed successfully: ${model.name} v${version.version}`,
        stage: 'deployment',
      });

    } catch (error) {
      run.logs.push({
        timestamp: new Date(),
        level: 'error',
        message: `Auto-deployment failed: ${error.message}`,
        stage: 'deployment',
      });
    }

    await this.pipelineRunRepository.save(run);
  }

  private generateStorageLocation(name: string, companyId: string): string {
    const sanitizedName = name.replace(/\s+/g, '_').toLowerCase();
    return `s3://ml-datasets/${companyId}/${sanitizedName}_${Date.now()}`;
  }
}