export interface Company {
  id: string;
  name: string;
  logo?: string;
  location: {
    city: string;
    country: string;
  };
  industry: string;
  description?: string;
  website?: string;
  confidence?: number; // For search results
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanySearchResult {
  companies: Company[];
  totalCount: number;
  searchQuery: string;
}

export interface CompanySearchRequest {
  query: string;
  limit?: number;
  offset?: number;
  industry?: string;
  country?: string;
}

export interface CreateCompanyRequest {
  name: string;
  industry: string;
  location: {
    city: string;
    country: string;
  };
  website?: string;
  description?: string;
}

export interface CompanyContextData {
  company: Company;
  additionalContext?: {
    employeeCount?: string;
    foundedYear?: number;
    socialProfiles?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
    };
  };
}