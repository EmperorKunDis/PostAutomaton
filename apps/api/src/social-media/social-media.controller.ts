import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Req, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { SocialMediaService } from './social-media.service';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  GenerateSocialPostsRequest,
  GenerateSocialPostsResponse,
  SocialMediaContentPlan,
  SocialMediaPost,
  UpdateSocialPostRequest,
  RegenerateSocialPostRequest
} from '@internal-marketing-content-app/shared';

@Controller('social-media')
@UseGuards(JwtAuthGuard)
export class SocialMediaController {
  constructor(
    private readonly socialMediaService: SocialMediaService,
    private readonly exportService: ExportService
  ) {}

  @Post('generate')
  async generateSocialPosts(
    @Body() request: GenerateSocialPostsRequest,
    @Req() req: any
  ): Promise<GenerateSocialPostsResponse> {
    return this.socialMediaService.generateSocialPosts(request, req.user.id);
  }

  @Get('content-plans')
  async getContentPlans(
    @Query('companyId') companyId?: string
  ): Promise<SocialMediaContentPlan[]> {
    return this.socialMediaService.getContentPlans(companyId);
  }

  @Get('content-plans/:id')
  async getContentPlan(
    @Param('id') id: string
  ): Promise<SocialMediaContentPlan> {
    return this.socialMediaService.getContentPlan(id);
  }

  @Put('posts/:postId')
  async updateSocialPost(
    @Param('postId') postId: string,
    @Body() updateRequest: UpdateSocialPostRequest,
    @Req() req: any
  ): Promise<SocialMediaPost> {
    return this.socialMediaService.updateSocialPost(postId, updateRequest, req.user.id);
  }

  @Post('posts/:postId/regenerate')
  async regenerateSocialPost(
    @Param('postId') postId: string,
    @Body() regenerateRequest: RegenerateSocialPostRequest,
    @Req() req: any
  ): Promise<SocialMediaPost> {
    return this.socialMediaService.regenerateSocialPost(postId, regenerateRequest, req.user.id);
  }

  @Delete('posts/:postId')
  async deleteSocialPost(
    @Param('postId') postId: string,
    @Req() req: any
  ): Promise<void> {
    return this.socialMediaService.deleteSocialPost(postId, req.user.id);
  }

  // Export endpoints for Story 4.3
  @Get('content-plans/:id/export/csv')
  async exportContentPlanCSV(
    @Param('id') planId: string,
    @Req() req: any,
    @Res() res: Response
  ): Promise<void> {
    const data = await this.exportService.exportContentPlanData(planId, req.user.id);
    const csv = this.exportService.generateCSV(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="content-plan-${planId}.csv"`);
    res.status(HttpStatus.OK).send(csv);
  }

  @Get('content-plans/:id/export/notion')
  async exportContentPlanNotion(
    @Param('id') planId: string,
    @Req() req: any
  ): Promise<any> {
    const data = await this.exportService.exportContentPlanData(planId, req.user.id);
    return this.exportService.generateNotionFormat(data);
  }

  @Get('content-plans/:id/export/buffer')
  async exportContentPlanBuffer(
    @Param('id') planId: string,
    @Req() req: any
  ): Promise<any[]> {
    const data = await this.exportService.exportContentPlanData(planId, req.user.id);
    return this.exportService.generateBufferFormat(data);
  }

  @Get('content-plans/:id/export/hootsuite')
  async exportContentPlanHootsuite(
    @Param('id') planId: string,
    @Req() req: any
  ): Promise<any[]> {
    const data = await this.exportService.exportContentPlanData(planId, req.user.id);
    return this.exportService.generateHootsuiteFormat(data);
  }

  @Get('content-plans/:id/export/data')
  async getContentPlanExportData(
    @Param('id') planId: string,
    @Req() req: any
  ): Promise<any> {
    return this.exportService.exportContentPlanData(planId, req.user.id);
  }
}