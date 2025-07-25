import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Param, 
  Body, 
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentTopicsService } from './content-topics.service';
import { GenerateContentTopicsDto, UpdateContentTopicDto } from './dto/content-topics.dto';
import { 
  ContentTopic, 
  GenerateContentTopicsResponse,
  DEFAULT_TOPIC_CATEGORIES,
  TopicCategory
} from '@internal-marketing-content-app/shared';

@Controller('content-topics')
@UseGuards(JwtAuthGuard)
export class ContentTopicsController {
  constructor(private readonly contentTopicsService: ContentTopicsService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generateContentTopics(
    @Request() req: any,
    @Body() generateDto: GenerateContentTopicsDto
  ): Promise<GenerateContentTopicsResponse> {
    return this.contentTopicsService.generateContentTopics(req.user.id, generateDto);
  }

  @Get()
  async getContentTopics(
    @Request() req: any,
    @Query('companyId') companyId?: string
  ): Promise<ContentTopic[]> {
    return this.contentTopicsService.getContentTopics(req.user.id, companyId);
  }

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  getTopicCategories(): TopicCategory[] {
    return DEFAULT_TOPIC_CATEGORIES;
  }

  @Get(':id')
  async getContentTopic(
    @Request() req: any,
    @Param('id') id: string
  ): Promise<ContentTopic> {
    return this.contentTopicsService.getContentTopic(req.user.id, id);
  }

  @Put(':id')
  async updateContentTopic(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateContentTopicDto
  ): Promise<ContentTopic> {
    return this.contentTopicsService.updateContentTopic(req.user.id, id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteContentTopic(
    @Request() req: any,
    @Param('id') id: string
  ): Promise<void> {
    return this.contentTopicsService.deleteContentTopic(req.user.id, id);
  }
}