import { api } from './api';
import {
  WriterProfile,
  CreateWriterProfileRequest,
  UpdateWriterProfileRequest,
  GenerateWriterProfilesRequest
} from '@internal-marketing-content-app/shared';

export const writerProfileService = {
  // Generate writer profiles for a company
  generateProfiles: async (request: GenerateWriterProfilesRequest): Promise<WriterProfile[]> => {
    const response = await api.post('/writer-profiles/generate', request);
    return response.data;
  },

  // Get all writer profiles for a user/company
  getProfiles: async (params?: {
    companyId?: string;
    userId?: string;
    activeOnly?: boolean;
  }): Promise<WriterProfile[]> => {
    const response = await api.get('/writer-profiles', { params });
    return response.data;
  },

  // Get a specific writer profile
  getProfile: async (id: string): Promise<WriterProfile> => {
    const response = await api.get(`/writer-profiles/${id}`);
    return response.data;
  },

  // Create a new writer profile
  createProfile: async (request: CreateWriterProfileRequest): Promise<WriterProfile> => {
    const response = await api.post('/writer-profiles', request);
    return response.data;
  },

  // Update an existing writer profile
  updateProfile: async (id: string, request: UpdateWriterProfileRequest): Promise<WriterProfile> => {
    const response = await api.put(`/writer-profiles/${id}`, request);
    return response.data;
  },

  // Update social platforms for a profile
  updateSocialPlatforms: async (id: string, platforms: string[]): Promise<WriterProfile> => {
    const response = await api.put(`/writer-profiles/${id}/social-platforms`, { socialPlatforms: platforms });
    return response.data;
  },

  // Delete a writer profile
  deleteProfile: async (id: string): Promise<void> => {
    await api.delete(`/writer-profiles/${id}`);
  }
};