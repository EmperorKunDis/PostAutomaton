import { apiClient } from './api';
import { 
  Company, 
  CompanySearchResult, 
  CompanySearchRequest, 
  CreateCompanyRequest 
} from '@internal-marketing-content-app/shared';

export const companyService = {
  async searchCompanies(searchParams: CompanySearchRequest): Promise<CompanySearchResult> {
    const params = new URLSearchParams();
    params.append('query', searchParams.query);
    
    if (searchParams.limit) params.append('limit', searchParams.limit.toString());
    if (searchParams.offset) params.append('offset', searchParams.offset.toString());
    if (searchParams.industry) params.append('industry', searchParams.industry);
    if (searchParams.country) params.append('country', searchParams.country);

    const response = await apiClient.get<CompanySearchResult>(`/companies/search?${params.toString()}`);
    return response.data;
  },

  async getCompanyById(id: string): Promise<Company> {
    const response = await apiClient.get<Company>(`/companies/${id}`);
    return response.data;
  },

  async createCompany(companyData: CreateCompanyRequest): Promise<Company> {
    const response = await apiClient.post<Company>('/companies', companyData);
    return response.data;
  },

  async seedMockData(): Promise<void> {
    await apiClient.post('/companies/seed');
  }
};