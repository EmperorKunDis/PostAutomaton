import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { 
  GenerateContentTopicsRequest, 
  UpdateContentTopicRequest,
  ContentGoal,
  TopicCategory,
  DEFAULT_TOPIC_CATEGORIES
} from '@internal-marketing-content-app/shared';

// ContentGoal is a string union type, no DTO needed

export class GenerateContentTopicsDto implements GenerateContentTopicsRequest {
  @IsUUID()
  companyId: string;

  @IsNumber()
  year: number;

  @IsNumber()
  monthlyTopicCount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  categories: TopicCategory[];

  @IsArray()
  @IsEnum(['brand_awareness', 'thought_leadership', 'product_promotion', 'lead_generation', 'recruitment', 'customer_education', 'industry_insights', 'company_culture'], { each: true })
  contentGoals: ContentGoal[];

  @IsBoolean()
  includeSeasonal: boolean;

  @IsArray()
  @IsString({ each: true })
  focusKeywords: string[];

  @IsString()
  additionalInstructions: string;
}

export class UpdateContentTopicDto implements UpdateContentTopicRequest {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  category?: TopicCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsNumber()
  plannedMonth?: number;

  @IsOptional()
  @IsNumber()
  plannedYear?: number;

  @IsOptional()
  @IsEnum(['high', 'medium', 'low'])
  priority?: 'high' | 'medium' | 'low';

  @IsOptional()
  @IsEnum(['planned', 'in_progress', 'completed', 'cancelled'])
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled';

  @IsOptional()
  @IsUUID()
  writerProfileId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seasonalEvents?: string[];

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seoKeywords?: string[];

  @IsOptional()
  @IsNumber()
  estimatedReadTime?: number;
}