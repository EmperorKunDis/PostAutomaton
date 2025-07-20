import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CompanyContextService } from './company-context.service';
import { CreateCompanyContextDto, UpdateCompanyContextDto, AnalyzeCompanyRequestDto } from './dto/company-context.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('company-context')
@UseGuards(JwtAuthGuard)
export class CompanyContextController {
  constructor(private readonly companyContextService: CompanyContextService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  async analyzeCompany(@Body() analyzeDto: AnalyzeCompanyRequestDto) {
    return await this.companyContextService.analyzeCompany(analyzeDto.companyId);
  }

  @Get('company/:companyId')
  async getByCompanyId(@Param('companyId') companyId: string) {
    return await this.companyContextService.getByCompanyId(companyId);
  }

  @Post()
  async create(@Body() createDto: CreateCompanyContextDto) {
    return await this.companyContextService.create(createDto);
  }

  @Put('company/:companyId')
  async update(
    @Param('companyId') companyId: string,
    @Body() updateDto: UpdateCompanyContextDto,
  ) {
    return await this.companyContextService.update(companyId, updateDto);
  }

  @Delete('company/:companyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('companyId') companyId: string) {
    await this.companyContextService.delete(companyId);
  }
}