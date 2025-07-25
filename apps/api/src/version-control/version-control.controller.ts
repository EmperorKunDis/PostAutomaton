import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { VersionControlService } from './version-control.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ContentHistoryRequest,
  ContentHistoryResponse,
  VersionComparisonRequest,
  VersionComparisonResponse,
  RestoreVersionRequest
} from '@internal-marketing-content-app/shared';

@Controller('version-control')
@UseGuards(JwtAuthGuard)
export class VersionControlController {
  constructor(private readonly versionControlService: VersionControlService) {}

  @Post('history')
  async getContentHistory(
    @Body() request: ContentHistoryRequest
  ): Promise<ContentHistoryResponse> {
    return this.versionControlService.getContentHistory(request);
  }

  @Post('compare')
  async compareVersions(
    @Body() request: VersionComparisonRequest
  ): Promise<VersionComparisonResponse> {
    return this.versionControlService.compareVersions(request);
  }

  @Post('restore')
  async restoreVersion(
    @Body() request: RestoreVersionRequest,
    @Req() req: any
  ): Promise<{ message: string }> {
    await this.versionControlService.restoreVersion(request, req.user.id);
    return { message: 'Version restored successfully' };
  }
}