import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIModel } from '../../database/entities/ai-model.entity';
import { ModelVersion } from '../../database/entities/model-version.entity';
import { ModelDeployment } from '../../database/entities/model-deployment.entity';
import { 
  CreateAIModelRequest,
  UpdateAIModelRequest,
  DeployModelRequest,
  ModelType,
  ModelStatus,
  DeploymentEnvironment,
  ModelMetrics,
  ModelPredictionRequest,
  ModelPredictionResponse
} from '@internal-marketing-content-app/shared';

@Injectable()
export class AIModelService {
  constructor(
    @InjectRepository(AIModel)
    private aiModelRepository: Repository<AIModel>,
    
    @InjectRepository(ModelVersion)
    private modelVersionRepository: Repository<ModelVersion>,
    
    @InjectRepository(ModelDeployment)
    private modelDeploymentRepository: Repository<ModelDeployment>,
  ) {}

  async createModel(request: CreateAIModelRequest): Promise<AIModel> {
    const model = this.aiModelRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      name: request.name,
      description: request.description,
      modelType: request.modelType,
      status: 'draft',
      configuration: request.configuration || {},
      trainingConfig: request.trainingConfig || {},
      hyperparameters: request.hyperparameters || {},
      tags: request.tags || [],
      isActive: true,
    });

    return this.aiModelRepository.save(model);
  }

  async getModels(companyId: string, modelType?: ModelType): Promise<AIModel[]> {
    const query = this.aiModelRepository
      .createQueryBuilder('model')
      .leftJoinAndSelect('model.versions', 'versions')
      .leftJoinAndSelect('model.deployments', 'deployments')
      .where('model.companyId = :companyId', { companyId })
      .orderBy('model.createdAt', 'DESC');

    if (modelType) {
      query.andWhere('model.modelType = :modelType', { modelType });
    }

    return query.getMany();
  }

  async getModel(id: string, companyId: string): Promise<AIModel> {
    const model = await this.aiModelRepository
      .createQueryBuilder('model')
      .leftJoinAndSelect('model.versions', 'versions')
      .leftJoinAndSelect('model.deployments', 'deployments')
      .where('model.id = :id', { id })
      .andWhere('model.companyId = :companyId', { companyId })
      .getOne();

    if (!model) {
      throw new Error('AI model not found');
    }

    return model;
  }

  async updateModel(
    id: string,
    companyId: string,
    request: UpdateAIModelRequest
  ): Promise<AIModel> {
    const model = await this.getModel(id, companyId);

    Object.assign(model, {
      name: request.name ?? model.name,
      description: request.description ?? model.description,
      configuration: request.configuration ?? model.configuration,
      trainingConfig: request.trainingConfig ?? model.trainingConfig,
      hyperparameters: request.hyperparameters ?? model.hyperparameters,
      tags: request.tags ?? model.tags,
      isActive: request.isActive ?? model.isActive,
    });

    return this.aiModelRepository.save(model);
  }

  async deleteModel(id: string, companyId: string): Promise<void> {
    const model = await this.getModel(id, companyId);
    
    // Check if model has active deployments
    const activeDeployments = await this.modelDeploymentRepository.count({
      where: { modelId: id, status: 'active' },
    });

    if (activeDeployments > 0) {
      throw new Error('Cannot delete model with active deployments');
    }

    await this.aiModelRepository.remove(model);
  }

  async createVersion(
    modelId: string,
    companyId: string,
    versionData: {
      version: string;
      description?: string;
      modelArtifactUrl: string;
      metrics?: ModelMetrics;
      trainingMetadata?: Record<string, any>;
    }
  ): Promise<ModelVersion> {
    const model = await this.getModel(modelId, companyId);

    // Check if version already exists
    const existingVersion = await this.modelVersionRepository.findOne({
      where: { modelId, version: versionData.version },
    });

    if (existingVersion) {
      throw new Error(`Version ${versionData.version} already exists for this model`);
    }

    const version = this.modelVersionRepository.create({
      modelId,
      version: versionData.version,
      description: versionData.description,
      modelArtifactUrl: versionData.modelArtifactUrl,
      metrics: versionData.metrics || {},
      trainingMetadata: versionData.trainingMetadata || {},
      status: 'ready',
      isActive: true,
    });

    const savedVersion = await this.modelVersionRepository.save(version);

    // Update model status if this is the first version
    if (model.status === 'draft') {
      model.status = 'trained';
      await this.aiModelRepository.save(model);
    }

    return savedVersion;
  }

  async getVersions(modelId: string, companyId: string): Promise<ModelVersion[]> {
    // Verify model access
    await this.getModel(modelId, companyId);

    return this.modelVersionRepository.find({
      where: { modelId },
      order: { createdAt: 'DESC' },
    });
  }

  async deployModel(request: DeployModelRequest): Promise<ModelDeployment> {
    const model = await this.getModel(request.modelId, request.companyId);
    
    const version = await this.modelVersionRepository.findOne({
      where: { id: request.versionId, modelId: request.modelId },
    });

    if (!version) {
      throw new Error('Model version not found');
    }

    // Check for existing deployment in the same environment
    const existingDeployment = await this.modelDeploymentRepository.findOne({
      where: { 
        modelId: request.modelId, 
        environment: request.environment,
        status: 'active'
      },
    });

    if (existingDeployment && !request.replaceExisting) {
      throw new Error(`Model already deployed in ${request.environment} environment`);
    }

    // Deactivate existing deployment if replacing
    if (existingDeployment && request.replaceExisting) {
      existingDeployment.status = 'inactive';
      existingDeployment.deactivatedAt = new Date();
      await this.modelDeploymentRepository.save(existingDeployment);
    }

    const deployment = this.modelDeploymentRepository.create({
      modelId: request.modelId,
      versionId: request.versionId,
      companyId: request.companyId,
      environment: request.environment,
      deploymentName: request.deploymentName || `${model.name}-${request.environment}`,
      configuration: request.configuration || {},
      scalingConfig: request.scalingConfig || {
        minInstances: 1,
        maxInstances: 3,
        targetCPU: 70,
        targetMemory: 80,
      },
      status: 'deploying',
      healthCheckUrl: request.healthCheckUrl,
      apiEndpoint: this.generateAPIEndpoint(model.id, request.environment),
    });

    const savedDeployment = await this.modelDeploymentRepository.save(deployment);

    // Simulate deployment process
    this.simulateDeployment(savedDeployment.id).catch(error => {
      console.error(`Deployment failed for ${savedDeployment.id}:`, error);
    });

    return savedDeployment;
  }

  async getDeployments(companyId: string, environment?: DeploymentEnvironment): Promise<ModelDeployment[]> {
    const query = this.modelDeploymentRepository
      .createQueryBuilder('deployment')
      .leftJoinAndSelect('deployment.model', 'model')
      .leftJoinAndSelect('deployment.version', 'version')
      .where('deployment.companyId = :companyId', { companyId })
      .orderBy('deployment.createdAt', 'DESC');

    if (environment) {
      query.andWhere('deployment.environment = :environment', { environment });
    }

    return query.getMany();
  }

  async undeployModel(deploymentId: string, companyId: string): Promise<ModelDeployment> {
    const deployment = await this.modelDeploymentRepository.findOne({
      where: { id: deploymentId, companyId },
    });

    if (!deployment) {
      throw new Error('Deployment not found');
    }

    deployment.status = 'inactive';
    deployment.deactivatedAt = new Date();

    return this.modelDeploymentRepository.save(deployment);
  }

  async makePrediction(request: ModelPredictionRequest): Promise<ModelPredictionResponse> {
    const deployment = await this.modelDeploymentRepository.findOne({
      where: { 
        id: request.deploymentId, 
        companyId: request.companyId,
        status: 'active'
      },
      relations: ['model', 'version'],
    });

    if (!deployment) {
      throw new Error('Active deployment not found');
    }

    // Validate input data against model schema
    this.validatePredictionInput(deployment.model, request.inputData);

    // Make prediction (mock implementation)
    const prediction = await this.callModelAPI(deployment, request.inputData);

    // Log prediction for monitoring
    await this.logPrediction(deployment.id, request.inputData, prediction);

    return {
      deploymentId: deployment.id,
      modelId: deployment.model.id,
      versionId: deployment.version.id,
      prediction: prediction.result,
      confidence: prediction.confidence,
      features: prediction.features,
      metadata: {
        modelType: deployment.model.modelType,
        version: deployment.version.version,
        timestamp: new Date(),
        processingTime: prediction.processingTime,
      },
    };
  }

  async getModelMetrics(
    modelId: string, 
    companyId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<{
    predictions: number;
    accuracy: number;
    latency: number;
    throughput: number;
    errorRate: number;
    costs: number;
  }> {
    // Verify model access
    await this.getModel(modelId, companyId);

    // Mock metrics - in real implementation, aggregate from prediction logs
    return {
      predictions: Math.floor(Math.random() * 10000) + 1000,
      accuracy: 0.85 + Math.random() * 0.1, // 85-95%
      latency: 50 + Math.random() * 100, // 50-150ms
      throughput: 100 + Math.random() * 400, // 100-500 req/min
      errorRate: Math.random() * 0.05, // 0-5%
      costs: Math.random() * 100 + 20, // $20-120
    };
  }

  async optimizeModel(
    modelId: string,
    companyId: string,
    optimizationConfig: {
      target: 'accuracy' | 'speed' | 'cost';
      constraints?: Record<string, any>;
    }
  ): Promise<{
    originalMetrics: ModelMetrics;
    optimizedMetrics: ModelMetrics;
    recommendations: string[];
  }> {
    const model = await this.getModel(modelId, companyId);

    // Mock optimization - in real implementation, run optimization algorithms
    const originalMetrics = {
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.88,
      f1Score: 0.85,
      latency: 120,
      throughput: 250,
    };

    const optimizedMetrics = {
      accuracy: optimizationConfig.target === 'accuracy' ? 0.92 : 0.83,
      precision: optimizationConfig.target === 'accuracy' ? 0.90 : 0.81,
      recall: optimizationConfig.target === 'accuracy' ? 0.94 : 0.85,
      f1Score: optimizationConfig.target === 'accuracy' ? 0.92 : 0.83,
      latency: optimizationConfig.target === 'speed' ? 60 : 140,
      throughput: optimizationConfig.target === 'speed' ? 450 : 220,
    };

    const recommendations = this.generateOptimizationRecommendations(
      optimizationConfig.target,
      originalMetrics,
      optimizedMetrics
    );

    return {
      originalMetrics,
      optimizedMetrics,
      recommendations,
    };
  }

  private async simulateDeployment(deploymentId: string): Promise<void> {
    // Simulate deployment time (2-5 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const deployment = await this.modelDeploymentRepository.findOne({
      where: { id: deploymentId },
    });

    if (deployment) {
      // 90% success rate
      const success = Math.random() > 0.1;
      
      deployment.status = success ? 'active' : 'failed';
      deployment.deployedAt = success ? new Date() : undefined;
      deployment.errorMessage = success ? undefined : 'Deployment failed due to resource constraints';

      await this.modelDeploymentRepository.save(deployment);
    }
  }

  private validatePredictionInput(model: AIModel, inputData: Record<string, any>): void {
    // Mock validation - in real implementation, validate against model schema
    if (!inputData || Object.keys(inputData).length === 0) {
      throw new Error('Input data is required for prediction');
    }

    // Type-specific validation
    switch (model.modelType) {
      case 'content_classifier':
        if (!inputData.text || typeof inputData.text !== 'string') {
          throw new Error('Text input is required for content classification');
        }
        break;
      case 'engagement_predictor':
        if (!inputData.content || !inputData.metadata) {
          throw new Error('Content and metadata are required for engagement prediction');
        }
        break;
      case 'sentiment_analyzer':
        if (!inputData.text) {
          throw new Error('Text input is required for sentiment analysis');
        }
        break;
    }
  }

  private async callModelAPI(
    deployment: ModelDeployment,
    inputData: Record<string, any>
  ): Promise<{
    result: any;
    confidence: number;
    features?: Record<string, any>;
    processingTime: number;
  }> {
    const startTime = Date.now();

    // Mock API call - in real implementation, call actual model endpoint
    let result: any;
    let confidence: number;
    let features: Record<string, any> = {};

    switch (deployment.model.modelType) {
      case 'content_classifier':
        result = this.mockContentClassification(inputData.text);
        confidence = 0.85 + Math.random() * 0.1;
        features = { textLength: inputData.text.length, wordCount: inputData.text.split(' ').length };
        break;
        
      case 'engagement_predictor':
        result = this.mockEngagementPrediction(inputData);
        confidence = 0.75 + Math.random() * 0.2;
        features = { contentType: inputData.metadata?.type, platform: inputData.metadata?.platform };
        break;
        
      case 'sentiment_analyzer':
        result = this.mockSentimentAnalysis(inputData.text);
        confidence = 0.80 + Math.random() * 0.15;
        features = { textLength: inputData.text.length, wordCount: inputData.text.split(' ').length };
        break;
        
      default:
        result = { prediction: 'unknown' };
        confidence = 0.5;
    }

    const processingTime = Date.now() - startTime;

    return {
      result,
      confidence,
      features,
      processingTime,
    };
  }

  private mockContentClassification(text: string): { category: string; subcategory: string; tags: string[] } {
    const categories = ['marketing', 'technical', 'educational', 'news', 'entertainment'];
    const subcategories = ['blog-post', 'social-media', 'email-campaign', 'product-update', 'tutorial'];
    const tags = ['ai', 'technology', 'business', 'growth', 'strategy'];

    return {
      category: categories[Math.floor(Math.random() * categories.length)],
      subcategory: subcategories[Math.floor(Math.random() * subcategories.length)],
      tags: tags.slice(0, 2 + Math.floor(Math.random() * 3)),
    };
  }

  private mockEngagementPrediction(inputData: Record<string, any>): { 
    predictedViews: number; 
    predictedLikes: number; 
    predictedShares: number; 
    engagementScore: number;
  } {
    return {
      predictedViews: Math.floor(Math.random() * 10000) + 500,
      predictedLikes: Math.floor(Math.random() * 500) + 50,
      predictedShares: Math.floor(Math.random() * 100) + 10,
      engagementScore: 0.1 + Math.random() * 0.4, // 10-50%
    };
  }

  private mockSentimentAnalysis(text: string): { 
    sentiment: 'positive' | 'negative' | 'neutral'; 
    score: number; 
    emotions: Record<string, number>;
  } {
    const sentiments = ['positive', 'negative', 'neutral'] as const;
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    return {
      sentiment,
      score: sentiment === 'positive' ? 0.7 + Math.random() * 0.3 : 
             sentiment === 'negative' ? -0.7 - Math.random() * 0.3 : 
             -0.2 + Math.random() * 0.4,
      emotions: {
        joy: Math.random() * 0.8,
        anger: Math.random() * 0.3,
        fear: Math.random() * 0.2,
        sadness: Math.random() * 0.4,
        surprise: Math.random() * 0.6,
      },
    };
  }

  private async logPrediction(
    deploymentId: string,
    inputData: Record<string, any>,
    prediction: any
  ): Promise<void> {
    // Mock logging - in real implementation, log to monitoring system
    console.log(`Prediction logged for deployment ${deploymentId}`, {
      timestamp: new Date(),
      inputSize: JSON.stringify(inputData).length,
      predictionType: typeof prediction.result,
    });
  }

  private generateAPIEndpoint(modelId: string, environment: DeploymentEnvironment): string {
    const baseUrl = environment === 'production' ? 'https://api.example.com' : 'https://staging-api.example.com';
    return `${baseUrl}/v1/models/${modelId}/predict`;
  }

  private generateOptimizationRecommendations(
    target: string,
    original: ModelMetrics,
    optimized: ModelMetrics
  ): string[] {
    const recommendations: string[] = [];

    switch (target) {
      case 'accuracy':
        if (optimized.accuracy > original.accuracy) {
          recommendations.push('Increase model complexity with deeper neural networks');
          recommendations.push('Add more diverse training data');
          recommendations.push('Implement ensemble methods for better predictions');
        }
        break;
        
      case 'speed':
        if (optimized.latency < original.latency) {
          recommendations.push('Use model quantization to reduce inference time');
          recommendations.push('Implement model caching for frequent predictions');
          recommendations.push('Consider edge deployment for faster response times');
        }
        break;
        
      case 'cost':
        recommendations.push('Use auto-scaling to optimize resource usage');
        recommendations.push('Implement batch processing for multiple predictions');
        recommendations.push('Consider using smaller model variants during low-traffic periods');
        break;
    }

    return recommendations;
  }
}