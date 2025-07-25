import { apiClient } from './api';
import {
  ContentHistoryRequest,
  ContentHistoryResponse,
  VersionComparisonRequest,
  VersionComparisonResponse,
  RestoreVersionRequest
} from '@internal-marketing-content-app/shared';

export class VersionControlService {
  async getContentHistory(request: ContentHistoryRequest): Promise<ContentHistoryResponse> {
    const response = await apiClient.post('/version-control/history', request);
    return response.data as ContentHistoryResponse;
  }

  async compareVersions(request: VersionComparisonRequest): Promise<VersionComparisonResponse> {
    const response = await apiClient.post('/version-control/compare', request);
    return response.data as VersionComparisonResponse;
  }

  async restoreVersion(request: RestoreVersionRequest): Promise<{ message: string }> {
    const response = await apiClient.post('/version-control/restore', request);
    return response.data as { message: string };
  }
}

export const versionControlService = new VersionControlService();