import { IsString, IsEnum, IsArray, IsUUID, IsOptional } from 'class-validator';
import { CompanySizeIndicator, TargetMarket } from '@internal-marketing-content-app/shared';

export class CreateCompanyContextDto {
  @IsUUID()
  companyId: string;

  @IsString()
  industryVertical: string;

  @IsEnum(['Startup', 'SMB', 'Enterprise', 'Corporation'])
  companySizeIndicator: CompanySizeIndicator;

  @IsEnum(['B2B', 'B2C', 'B2B2C'])
  targetMarket: TargetMarket;

  @IsArray()
  @IsString({ each: true })
  contentThemes: string[];

  @IsArray()
  @IsString({ each: true })
  keyDifferentiators: string[];

  @IsString()
  competitivePosition: string;

  @IsArray()
  @IsString({ each: true })
  brandPersonality: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  generatedInsights?: string[];
}

export class UpdateCompanyContextDto {
  @IsString()
  @IsOptional()
  industryVertical?: string;

  @IsEnum(['Startup', 'SMB', 'Enterprise', 'Corporation'])
  @IsOptional()
  companySizeIndicator?: CompanySizeIndicator;

  @IsEnum(['B2B', 'B2C', 'B2B2C'])
  @IsOptional()
  targetMarket?: TargetMarket;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contentThemes?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keyDifferentiators?: string[];

  @IsString()
  @IsOptional()
  competitivePosition?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  brandPersonality?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  generatedInsights?: string[];
}

export class AnalyzeCompanyRequestDto {
  @IsUUID()
  companyId: string;
}