import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  Request,
  ValidationPipe
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { 
  SearchCompaniesDto, 
  CreateCompanyDto, 
  CompanySearchResponseDto,
  CompanyResponseDto 
} from './dto/company.dto';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('search')
  async searchCompanies(
    @Query(ValidationPipe) searchDto: SearchCompaniesDto
  ): Promise<CompanySearchResponseDto> {
    return this.companiesService.searchCompanies(searchDto);
  }

  @Get(':id')
  async getCompany(@Param('id') id: string): Promise<CompanyResponseDto> {
    const company = await this.companiesService.getCompanyById(id);
    return company;
  }

  @Post()
  async createCompany(
    @Body(ValidationPipe) createCompanyDto: CreateCompanyDto,
    @Request() req
  ): Promise<CompanyResponseDto> {
    const userId = req.user?.id;
    const company = await this.companiesService.createCompany(createCompanyDto, userId);
    return company;
  }

  @Post('seed')
  async seedMockData(): Promise<{ message: string }> {
    await this.companiesService.seedMockData();
    return { message: 'Mock data seeded successfully' };
  }
}