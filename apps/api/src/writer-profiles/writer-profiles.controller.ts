import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { WriterProfilesService } from './writer-profiles.service';
import { CreateWriterProfileDto, UpdateWriterProfileDto, GenerateWriterProfilesDto, GetWriterProfilesQueryDto } from './dto/writer-profiles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('writer-profiles')
@UseGuards(JwtAuthGuard)
export class WriterProfilesController {
  constructor(private readonly writerProfilesService: WriterProfilesService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateProfiles(@Body() generateDto: GenerateWriterProfilesDto) {
    return await this.writerProfilesService.generateProfiles(generateDto);
  }

  @Get()
  async getProfiles(@Query() query: GetWriterProfilesQueryDto) {
    if (query.companyId && query.userId) {
      return await this.writerProfilesService.getByCompanyAndUser(
        query.companyId,
        query.userId,
        query.activeOnly
      );
    }
    
    // If no specific filters, return empty array or implement general listing
    return [];
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return await this.writerProfilesService.getById(id);
  }

  @Post()
  async createProfile(@Body() createDto: CreateWriterProfileDto) {
    return await this.writerProfilesService.create(createDto);
  }

  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateDto: UpdateWriterProfileDto,
  ) {
    return await this.writerProfilesService.update(id, updateDto);
  }

  @Put(':id/social-platforms')
  async updateSocialPlatforms(
    @Param('id') id: string,
    @Body('socialPlatforms') socialPlatforms: string[],
  ) {
    return await this.writerProfilesService.updateSocialPlatforms(id, socialPlatforms);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Param('id') id: string) {
    await this.writerProfilesService.delete(id);
  }
}