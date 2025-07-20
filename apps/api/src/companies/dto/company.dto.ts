import { IsString, IsOptional, IsNumber, Min, Max, IsObject, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsString()
  city: string;

  @IsString()
  country: string;
}

export class SearchCompaniesDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  industry: string;

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CompanyResponseDto {
  id: string;
  name: string;
  logo?: string;
  location: {
    city: string;
    country: string;
  };
  industry: string;
  description?: string;
  website?: string;
  confidence?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CompanySearchResponseDto {
  companies: CompanyResponseDto[];
  totalCount: number;
  searchQuery: string;
}