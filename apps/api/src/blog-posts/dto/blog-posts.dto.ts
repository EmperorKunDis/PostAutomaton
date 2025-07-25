import { IsString, IsUUID, IsOptional, IsNumber, IsArray, IsEnum, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import {
  GenerateBlogPostRequest as IGenerateBlogPostRequest,
  UpdateBlogPostSectionRequest as IUpdateBlogPostSectionRequest,
  RegenerateBlogPostSectionRequest as IRegenerateBlogPostSectionRequest
} from '@internal-marketing-content-app/shared';

export class GenerateBlogPostRequestDto implements IGenerateBlogPostRequest {
  @IsUUID()
  contentTopicId: string;

  @IsOptional()
  @IsUUID()
  writerProfileId?: string;

  @IsOptional()
  @IsString()
  additionalInstructions?: string;

  @IsOptional()
  @IsNumber()
  @Min(500)
  @Max(10000)
  targetWordCount?: number;

  @IsOptional()
  includeOutline?: boolean;
}

export class UpdateBlogPostSectionRequestDto implements IUpdateBlogPostSectionRequest {
  @IsUUID()
  sectionId: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'needs_revision'])
  status?: 'pending' | 'approved' | 'needs_revision';
}

export class RegenerateBlogPostSectionRequestDto implements IRegenerateBlogPostSectionRequest {
  @IsUUID()
  sectionId: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsEnum(['shorter', 'longer', 'same'])
  length?: 'shorter' | 'longer' | 'same';
}