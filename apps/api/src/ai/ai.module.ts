import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { AIController } from './controllers/ai.controller';

// Services
import { AIModelService } from './services/ai-model.service';
import { TrainingPipelineService } from './services/training-pipeline.service';
import { ContentOptimizationService } from './services/content-optimization.service';

// Import Analytics services for dependencies
import { ContentMetricsService } from '../analytics/services/content-metrics.service';

// Entities
import { AIModel } from '../database/entities/ai-model.entity';
import { ModelVersion } from '../database/entities/model-version.entity';
import { ModelDeployment } from '../database/entities/model-deployment.entity';
import { TrainingPipeline } from '../database/entities/training-pipeline.entity';
import { PipelineRun } from '../database/entities/pipeline-run.entity';
import { TrainingDataset } from '../database/entities/training-dataset.entity';
import { FeatureStore } from '../database/entities/feature-store.entity';
import { ContentOptimizationSuggestion } from '../database/entities/content-optimization-suggestion.entity';
import { OptimizationRule } from '../database/entities/optimization-rule.entity';

// Analytics entities needed for ContentMetricsService
import { ContentMetric } from '../database/entities/content-metric.entity';
import { ConversionTracking } from '../database/entities/conversion-tracking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // AI entities
      AIModel,
      ModelVersion,
      ModelDeployment,
      TrainingPipeline,
      PipelineRun,
      TrainingDataset,
      FeatureStore,
      ContentOptimizationSuggestion,
      OptimizationRule,
      // Analytics entities for dependency injection
      ContentMetric,
      ConversionTracking,
    ]),
  ],
  controllers: [
    AIController,
  ],
  providers: [
    AIModelService,
    TrainingPipelineService,
    ContentOptimizationService,
    ContentMetricsService, // Import from analytics module
  ],
  exports: [
    AIModelService,
    TrainingPipelineService,
    ContentOptimizationService,
  ],
})
export class AIModule {}