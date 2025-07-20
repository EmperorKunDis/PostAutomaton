import { IsString, IsEnum, IsArray, IsUUID, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { WriterTone, WriterStyle } from '@internal-marketing-content-app/shared';

export class CreateWriterProfileDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  userId: string;

  @IsString()
  name: string;

  @IsString()
  position: string;

  @IsEnum(['Professional', 'Casual', 'Technical', 'Inspirational', 'Friendly'])
  tone: WriterTone;

  @IsEnum(['Informative', 'Persuasive', 'Educational', 'Entertaining', 'Analytical'])
  style: WriterStyle;

  @IsString()
  targetAudience: string;

  @IsArray()
  @IsString({ each: true })
  contentFocusAreas: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  socialPlatforms?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  companyFocusTips?: string[];

  @IsBoolean()
  @IsOptional()
  isCustom?: boolean;
}

export class UpdateWriterProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsEnum(['Professional', 'Casual', 'Technical', 'Inspirational', 'Friendly'])
  @IsOptional()
  tone?: WriterTone;

  @IsEnum(['Informative', 'Persuasive', 'Educational', 'Entertaining', 'Analytical'])
  @IsOptional()
  style?: WriterStyle;

  @IsString()
  @IsOptional()
  targetAudience?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contentFocusAreas?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  socialPlatforms?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  companyFocusTips?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isCustom?: boolean;
}

export class GenerateWriterProfilesDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  userId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  count?: number;

  @IsBoolean()
  @IsOptional()
  includeCustomization?: boolean;
}

export class GetWriterProfilesQueryDto {
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsBoolean()
  @IsOptional()
  activeOnly?: boolean;
}