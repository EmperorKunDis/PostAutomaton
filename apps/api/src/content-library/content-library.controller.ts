import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ContentLibraryService } from './content-library.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ContentLibrarySearchRequest,
  ContentLibrarySearchResponse,
  CreateContentTagRequest,
  UpdateContentAssetRequest,
  CreateReusableSnippetRequest,
  UpdateReusableSnippetRequest
} from '@internal-marketing-content-app/shared';

@Controller('content-library')
@UseGuards(JwtAuthGuard)
export class ContentLibraryController {
  constructor(private readonly contentLibraryService: ContentLibraryService) {}

  @Post('search')
  async searchContentLibrary(
    @Body() searchRequest: ContentLibrarySearchRequest,
    @Req() req: any
  ): Promise<ContentLibrarySearchResponse> {
    return this.contentLibraryService.searchContentLibrary(searchRequest, req.user.id);
  }

  @Post('tags')
  async createContentTag(
    @Body() request: CreateContentTagRequest,
    @Query('companyId') companyId: string,
    @Req() req: any
  ): Promise<any> {
    return this.contentLibraryService.createContentTag(request, companyId, req.user.id);
  }

  @Put('assets/:id')
  async updateContentAsset(
    @Param('id') id: string,
    @Body() request: Omit<UpdateContentAssetRequest, 'id'>,
    @Req() req: any
  ): Promise<any> {
    return this.contentLibraryService.updateContentAsset(
      { ...request, id }, 
      req.user.id
    );
  }

  @Post('snippets')
  async createReusableSnippet(
    @Body() request: CreateReusableSnippetRequest,
    @Query('companyId') companyId: string,
    @Req() req: any
  ): Promise<any> {
    return this.contentLibraryService.createReusableSnippet(request, companyId, req.user.id);
  }

  @Put('snippets/:id')
  async updateReusableSnippet(
    @Param('id') id: string,
    @Body() request: Omit<UpdateReusableSnippetRequest, 'id'>,
    @Req() req: any
  ): Promise<any> {
    return this.contentLibraryService.updateReusableSnippet(
      { ...request, id },
      req.user.id
    );
  }

  @Post('assets/:id/track-usage')
  async trackAssetUsage(
    @Param('id') assetId: string,
    @Body() request: {
      usedInType: 'blog_post' | 'social_post' | 'campaign';
      usedInId: string;
      platform?: string;
    },
    @Req() req: any
  ): Promise<void> {
    return this.contentLibraryService.trackAssetUsage(
      assetId,
      request.usedInType,
      request.usedInId,
      req.user.id,
      request.platform
    );
  }

  @Post('sync')
  async syncExistingContent(
    @Query('companyId') companyId: string,
    @Req() req: any
  ): Promise<{ message: string }> {
    await this.contentLibraryService.syncExistingContent(companyId, req.user.id);
    return { message: 'Content library synced successfully' };
  }
}