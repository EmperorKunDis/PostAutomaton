import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Company } from '../database/entities/company.entity';
import { SearchCompaniesDto, CreateCompanyDto, CompanySearchResponseDto } from './dto/company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  private normalizeSearchQuery(query: string): string {
    return query.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  }

  private calculateConfidence(company: Company, searchQuery: string): number {
    const normalizedQuery = this.normalizeSearchQuery(searchQuery);
    const normalizedName = this.normalizeSearchQuery(company.name);
    
    // Exact match
    if (normalizedName === normalizedQuery) return 100;
    
    // Starts with query
    if (normalizedName.startsWith(normalizedQuery)) return 90;
    
    // Contains query
    if (normalizedName.includes(normalizedQuery)) return 70;
    
    // Fuzzy match (simple implementation)
    const queryWords = normalizedQuery.split(' ');
    const nameWords = normalizedName.split(' ');
    const matchedWords = queryWords.filter(qw => 
      nameWords.some(nw => nw.includes(qw) || qw.includes(nw))
    );
    
    return Math.round((matchedWords.length / queryWords.length) * 60);
  }

  async searchCompanies(searchDto: SearchCompaniesDto): Promise<CompanySearchResponseDto> {
    const { query, limit = 10, offset = 0, industry, country } = searchDto;
    
    // Build query
    let queryBuilder = this.companyRepository.createQueryBuilder('company');
    
    // Search by name (case-insensitive partial match)
    queryBuilder.where('LOWER(company.name) LIKE :query', { 
      query: `%${query.toLowerCase()}%` 
    });
    
    // Filter by industry if provided
    if (industry) {
      queryBuilder.andWhere('LOWER(company.industry) = :industry', { 
        industry: industry.toLowerCase() 
      });
    }
    
    // Filter by country if provided
    if (country) {
      queryBuilder.andWhere("json_extract(company.location, '$.country') = :country", { 
        country 
      });
    }
    
    // Get total count
    const totalCount = await queryBuilder.getCount();
    
    // Apply pagination
    queryBuilder.skip(offset).take(limit);
    
    // Execute query
    const companies = await queryBuilder.getMany();
    
    // Calculate confidence scores and sort
    const companiesWithConfidence = companies
      .map(company => ({
        ...company,
        confidence: this.calculateConfidence(company, query)
      }))
      .sort((a, b) => b.confidence - a.confidence);
    
    return {
      companies: companiesWithConfidence,
      totalCount,
      searchQuery: query
    };
  }

  async getCompanyById(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    
    return company;
  }

  async createCompany(createCompanyDto: CreateCompanyDto, userId?: string): Promise<Company> {
    const normalizedName = this.normalizeSearchQuery(createCompanyDto.name);
    
    const company = this.companyRepository.create({
      ...createCompanyDto,
      normalizedName,
      isManualEntry: true,
      createdByUserId: userId
    });
    
    return this.companyRepository.save(company);
  }

  async seedMockData(): Promise<void> {
    const mockCompanies = [
      {
        name: 'Acme Corporation',
        industry: 'Technology',
        location: { city: 'San Francisco', country: 'USA' },
        description: 'Leading technology solutions provider',
        website: 'https://acme.example.com',
        normalizedName: 'acme corporation'
      },
      {
        name: 'Global Industries Inc',
        industry: 'Manufacturing',
        location: { city: 'New York', country: 'USA' },
        description: 'Multinational manufacturing company',
        website: 'https://globalindustries.example.com',
        normalizedName: 'global industries inc'
      },
      {
        name: 'TechStart Solutions',
        industry: 'Technology',
        location: { city: 'Austin', country: 'USA' },
        description: 'Innovative startup focused on AI solutions',
        website: 'https://techstart.example.com',
        normalizedName: 'techstart solutions'
      },
      {
        name: 'European Consulting Group',
        industry: 'Consulting',
        location: { city: 'London', country: 'UK' },
        description: 'Strategic business consulting services',
        website: 'https://ecg.example.com',
        normalizedName: 'european consulting group'
      },
      {
        name: 'Pacific Retail Co',
        industry: 'Retail',
        location: { city: 'Sydney', country: 'Australia' },
        description: 'Retail chain across Pacific region',
        website: 'https://pacificretail.example.com',
        normalizedName: 'pacific retail co'
      }
    ];

    // Check if we already have companies
    const count = await this.companyRepository.count();
    if (count === 0) {
      // Seed mock data
      await this.companyRepository.save(mockCompanies);
    }
  }
}