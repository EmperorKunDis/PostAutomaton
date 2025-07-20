import { api } from './api';
import {
  CompanyContext,
  CreateCompanyContextRequest,
  UpdateCompanyContextRequest,
  AnalyzeCompanyRequest
} from '@internal-marketing-content-app/shared';

export const companyContextService = {
  // Analyze a company to generate context
  analyzeCompany: async (request: AnalyzeCompanyRequest): Promise<CompanyContext> => {
    const response = await api.post('/company-context/analyze', request);
    return response.data;
  },

  // Get company context by company ID
  getContext: async (companyId: string): Promise<CompanyContext> => {
    const response = await api.get(`/company-context/company/${companyId}`);
    return response.data;
  },

  // Create company context manually
  createContext: async (request: CreateCompanyContextRequest): Promise<CompanyContext> => {
    const response = await api.post('/company-context', request);
    return response.data;
  },

  // Update company context
  updateContext: async (companyId: string, request: UpdateCompanyContextRequest): Promise<CompanyContext> => {
    const response = await api.put(`/company-context/company/${companyId}`, request);
    return response.data;
  },

  // Delete company context
  deleteContext: async (companyId: string): Promise<void> => {
    await api.delete(`/company-context/company/${companyId}`);
  }
};