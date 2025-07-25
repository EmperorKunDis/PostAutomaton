import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformIntegration } from '../../database/entities/platform-integration.entity';
import { ContentMetricsService } from './content-metrics.service';
import { 
  PlatformType,
  PlatformIntegrationStatus,
  CreatePlatformIntegrationRequest,
  UpdatePlatformIntegrationRequest,
  PlatformMetricsSyncRequest,
  MetricType
} from '@internal-marketing-content-app/shared';

@Injectable()
export class PlatformIntegrationService {
  constructor(
    @InjectRepository(PlatformIntegration)
    private platformIntegrationRepository: Repository<PlatformIntegration>,
    
    private contentMetricsService: ContentMetricsService,
  ) {}

  async createIntegration(request: CreatePlatformIntegrationRequest): Promise<PlatformIntegration> {
    // Validate credentials by testing connection
    const isValid = await this.validateCredentials(request.platform, request.credentials);
    
    const integration = this.platformIntegrationRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      platform: request.platform,
      name: request.name,
      credentials: this.encryptCredentials(request.credentials),
      settings: request.settings || {},
      syncFrequency: request.syncFrequency || 'daily',
      enabledMetrics: request.enabledMetrics || ['views', 'likes', 'shares', 'comments'],
      status: isValid ? 'active' : 'error',
      lastSyncAt: null,
      nextSyncAt: this.calculateNextSync(request.syncFrequency || 'daily'),
      isEnabled: true,
    });

    return this.platformIntegrationRepository.save(integration);
  }

  async getIntegrations(companyId: string): Promise<PlatformIntegration[]> {
    return this.platformIntegrationRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async getIntegration(id: string, companyId: string): Promise<PlatformIntegration> {
    const integration = await this.platformIntegrationRepository.findOne({
      where: { id, companyId },
    });

    if (!integration) {
      throw new Error('Platform integration not found');
    }

    // Don't return decrypted credentials in response
    return {
      ...integration,
      credentials: {},
    };
  }

  async updateIntegration(
    id: string, 
    companyId: string, 
    request: UpdatePlatformIntegrationRequest
  ): Promise<PlatformIntegration> {
    const integration = await this.platformIntegrationRepository.findOne({
      where: { id, companyId },
    });

    if (!integration) {
      throw new Error('Platform integration not found');
    }

    // If credentials are being updated, validate them
    let newCredentials = integration.credentials;
    if (request.credentials && Object.keys(request.credentials).length > 0) {
      const isValid = await this.validateCredentials(integration.platform, request.credentials);
      if (!isValid) {
        throw new Error('Invalid credentials provided');
      }
      newCredentials = this.encryptCredentials(request.credentials);
    }

    // Update fields
    Object.assign(integration, {
      name: request.name ?? integration.name,
      credentials: newCredentials,
      settings: request.settings ?? integration.settings,
      syncFrequency: request.syncFrequency ?? integration.syncFrequency,
      enabledMetrics: request.enabledMetrics ?? integration.enabledMetrics,
      isEnabled: request.isEnabled ?? integration.isEnabled,
      nextSyncAt: request.syncFrequency ? this.calculateNextSync(request.syncFrequency) : integration.nextSyncAt,
    });

    return this.platformIntegrationRepository.save(integration);
  }

  async deleteIntegration(id: string, companyId: string): Promise<void> {
    const result = await this.platformIntegrationRepository.delete({ id, companyId });
    
    if (result.affected === 0) {
      throw new Error('Platform integration not found');
    }
  }

  async syncPlatformMetrics(request: PlatformMetricsSyncRequest): Promise<{
    synced: number;
    errors: string[];
  }> {
    const integration = await this.platformIntegrationRepository.findOne({
      where: { id: request.integrationId, companyId: request.companyId },
    });

    if (!integration || !integration.isEnabled) {
      throw new Error('Platform integration not found or disabled');
    }

    const errors: string[] = [];
    let synced = 0;

    try {
      // Update sync status
      integration.status = 'syncing';
      integration.lastSyncStartedAt = new Date();
      await this.platformIntegrationRepository.save(integration);

      // Fetch metrics from platform
      const platformMetrics = await this.fetchMetricsFromPlatform(
        integration.platform,
        this.decryptCredentials(integration.credentials),
        request.entityIds,
        request.dateRange
      );

      // Save metrics to our system
      for (const metric of platformMetrics) {
        try {
          await this.contentMetricsService.trackMetric(metric);
          synced++;
        } catch (error) {
          errors.push(`Failed to save metric for ${metric.entityId}: ${error.message}`);
        }
      }

      // Update integration status
      integration.status = errors.length > 0 ? 'warning' : 'active';
      integration.lastSyncAt = new Date();
      integration.nextSyncAt = this.calculateNextSync(integration.syncFrequency);
      integration.syncStats = {
        lastSyncMetrics: synced,
        lastSyncErrors: errors.length,
        totalSyncs: (integration.syncStats?.totalSyncs || 0) + 1,
      };

    } catch (error) {
      integration.status = 'error';
      integration.lastError = error.message;
      errors.push(`Platform sync failed: ${error.message}`);
    }

    await this.platformIntegrationRepository.save(integration);

    return { synced, errors };
  }

  async testConnection(id: string, companyId: string): Promise<{ isValid: boolean; error?: string }> {
    const integration = await this.platformIntegrationRepository.findOne({
      where: { id, companyId },
    });

    if (!integration) {
      throw new Error('Platform integration not found');
    }

    try {
      const credentials = this.decryptCredentials(integration.credentials);
      const isValid = await this.validateCredentials(integration.platform, credentials);
      
      // Update status based on test result
      integration.status = isValid ? 'active' : 'error';
      integration.lastTestedAt = new Date();
      if (!isValid) {
        integration.lastError = 'Connection test failed';
      }
      
      await this.platformIntegrationRepository.save(integration);

      return { 
        isValid,
        error: !isValid ? 'Connection test failed' : undefined
      };
    } catch (error) {
      integration.status = 'error';
      integration.lastError = error.message;
      await this.platformIntegrationRepository.save(integration);

      return { 
        isValid: false, 
        error: error.message 
      };
    }
  }

  async getIntegrationsForSync(): Promise<PlatformIntegration[]> {
    const now = new Date();
    
    return this.platformIntegrationRepository.find({
      where: {
        isEnabled: true,
        status: 'active',
      },
      // Only get integrations where nextSyncAt is in the past
    }).then(integrations => 
      integrations.filter(i => i.nextSyncAt && i.nextSyncAt <= now)
    );
  }

  private async validateCredentials(platform: PlatformType, credentials: Record<string, any>): Promise<boolean> {
    switch (platform) {
      case 'facebook':
        return this.validateFacebookCredentials(credentials);
      case 'twitter':
        return this.validateTwitterCredentials(credentials);
      case 'linkedin':
        return this.validateLinkedInCredentials(credentials);
      case 'instagram':
        return this.validateInstagramCredentials(credentials);
      case 'youtube':
        return this.validateYouTubeCredentials(credentials);
      default:
        return false;
    }
  }

  private async validateFacebookCredentials(credentials: Record<string, any>): Promise<boolean> {
    try {
      // Mock validation - in real implementation, make API call to Facebook
      if (!credentials.accessToken || !credentials.pageId) {
        return false;
      }
      
      // const response = await fetch(`https://graph.facebook.com/me?access_token=${credentials.accessToken}`);
      // return response.ok;
      
      return true; // Mock success
    } catch {
      return false;
    }
  }

  private async validateTwitterCredentials(credentials: Record<string, any>): Promise<boolean> {
    try {
      // Mock validation - in real implementation, make API call to Twitter
      if (!credentials.apiKey || !credentials.apiSecret || !credentials.accessToken || !credentials.accessTokenSecret) {
        return false;
      }
      
      return true; // Mock success
    } catch {
      return false;
    }
  }

  private async validateLinkedInCredentials(credentials: Record<string, any>): Promise<boolean> {
    try {
      // Mock validation - in real implementation, make API call to LinkedIn
      if (!credentials.accessToken) {
        return false;
      }
      
      return true; // Mock success
    } catch {
      return false;
    }
  }

  private async validateInstagramCredentials(credentials: Record<string, any>): Promise<boolean> {
    try {
      // Mock validation - in real implementation, make API call to Instagram
      if (!credentials.accessToken) {
        return false;
      }
      
      return true; // Mock success
    } catch {
      return false;
    }
  }

  private async validateYouTubeCredentials(credentials: Record<string, any>): Promise<boolean> {
    try {
      // Mock validation - in real implementation, make API call to YouTube
      if (!credentials.apiKey || !credentials.channelId) {
        return false;
      }
      
      return true; // Mock success
    } catch {
      return false;
    }
  }

  private async fetchMetricsFromPlatform(
    platform: PlatformType,
    credentials: Record<string, any>,
    entityIds?: string[],
    dateRange?: { start: Date; end: Date }
  ): Promise<any[]> {
    // Mock implementation - in real implementation, call platform APIs
    const mockMetrics = [];
    const platforms = entityIds || ['mock-post-1', 'mock-post-2'];
    
    for (const entityId of platforms) {
      mockMetrics.push({
        entityType: 'social_post',
        entityId,
        entityTitle: `Mock Post ${entityId}`,
        metricType: 'views',
        value: Math.floor(Math.random() * 1000),
        platform,
        recordedAt: new Date(),
        eventProperties: { source: 'platform_sync' },
      });
    }

    return mockMetrics;
  }

  private encryptCredentials(credentials: Record<string, any>): Record<string, any> {
    // Mock encryption - in real implementation, use proper encryption
    return credentials;
  }

  private decryptCredentials(credentials: Record<string, any>): Record<string, any> {
    // Mock decryption - in real implementation, use proper decryption
    return credentials;
  }

  private calculateNextSync(frequency: string): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }
}