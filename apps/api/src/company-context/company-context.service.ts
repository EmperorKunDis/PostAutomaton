import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyContext } from '../database/entities/company-context.entity';
import { Company } from '../database/entities/company.entity';
import { CreateCompanyContextDto, UpdateCompanyContextDto } from './dto/company-context.dto';
import { CompanySizeIndicator, TargetMarket } from '@internal-marketing-content-app/shared';

@Injectable()
export class CompanyContextService {
  constructor(
    @InjectRepository(CompanyContext)
    private companyContextRepository: Repository<CompanyContext>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async analyzeCompany(companyId: string): Promise<CompanyContext> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId }
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if context already exists
    const existingContext = await this.companyContextRepository.findOne({
      where: { companyId }
    });

    if (existingContext) {
      return existingContext;
    }

    // Generate company context based on company information
    const context = await this.generateCompanyContext(company);
    
    const newContext = this.companyContextRepository.create({
      companyId,
      ...context
    });

    return await this.companyContextRepository.save(newContext);
  }

  async getByCompanyId(companyId: string): Promise<CompanyContext> {
    const context = await this.companyContextRepository.findOne({
      where: { companyId },
      relations: ['company']
    });

    if (!context) {
      throw new NotFoundException('Company context not found');
    }

    return context;
  }

  async create(createDto: CreateCompanyContextDto): Promise<CompanyContext> {
    const company = await this.companyRepository.findOne({
      where: { id: createDto.companyId }
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if context already exists
    const existingContext = await this.companyContextRepository.findOne({
      where: { companyId: createDto.companyId }
    });

    if (existingContext) {
      throw new BadRequestException('Company context already exists');
    }

    const context = this.companyContextRepository.create(createDto);
    return await this.companyContextRepository.save(context);
  }

  async update(companyId: string, updateDto: UpdateCompanyContextDto): Promise<CompanyContext> {
    const context = await this.getByCompanyId(companyId);
    
    Object.assign(context, updateDto);
    return await this.companyContextRepository.save(context);
  }

  async delete(companyId: string): Promise<void> {
    const context = await this.getByCompanyId(companyId);
    await this.companyContextRepository.remove(context);
  }

  private async generateCompanyContext(company: Company): Promise<Partial<CompanyContext>> {
    // Industry-based analysis
    const industryAnalysis = this.analyzeIndustry(company.industry);
    
    // Size indicator based on description and industry
    const sizeIndicator = this.determineSizeIndicator(company);
    
    // Target market analysis
    const targetMarket = this.analyzeTargetMarket(company.industry);
    
    // Generate content themes based on industry
    const contentThemes = this.generateContentThemes(company.industry);
    
    // Generate key differentiators
    const keyDifferentiators = this.generateKeyDifferentiators(company.industry);
    
    // Competitive position
    const competitivePosition = this.generateCompetitivePosition(company.industry, sizeIndicator);
    
    // Brand personality traits
    const brandPersonality = this.generateBrandPersonality(company.industry, sizeIndicator);
    
    // Generated insights
    const generatedInsights = this.generateInsights(company, sizeIndicator, targetMarket);

    return {
      industryVertical: company.industry,
      companySizeIndicator: sizeIndicator,
      targetMarket,
      contentThemes,
      keyDifferentiators,
      competitivePosition,
      brandPersonality,
      generatedInsights
    };
  }

  private analyzeIndustry(industry: string): string {
    // Normalize industry name
    return industry.charAt(0).toUpperCase() + industry.slice(1).toLowerCase();
  }

  private determineSizeIndicator(company: Company): CompanySizeIndicator {
    const description = company.description?.toLowerCase() || '';
    const name = company.name.toLowerCase();
    
    // Basic heuristics for company size
    if (description.includes('startup') || description.includes('new') || description.includes('emerging')) {
      return 'Startup';
    } else if (description.includes('enterprise') || description.includes('large') || description.includes('multinational')) {
      return 'Enterprise';
    } else if (description.includes('corporation') || description.includes('global') || name.includes('corp')) {
      return 'Corporation';
    } else {
      return 'SMB'; // Small/Medium Business as default
    }
  }

  private analyzeTargetMarket(industry: string): TargetMarket {
    const industryLower = industry.toLowerCase();
    
    // Industry-based target market mapping
    const b2bIndustries = ['software', 'technology', 'consulting', 'financial services', 'manufacturing', 'logistics'];
    const b2cIndustries = ['retail', 'consumer goods', 'entertainment', 'food', 'fashion', 'travel'];
    
    if (b2bIndustries.some(ind => industryLower.includes(ind))) {
      return 'B2B';
    } else if (b2cIndustries.some(ind => industryLower.includes(ind))) {
      return 'B2C';
    } else {
      return 'B2B2C'; // Mixed model as default for ambiguous industries
    }
  }

  private generateContentThemes(industry: string): string[] {
    const industryLower = industry.toLowerCase();
    
    const themeMap: Record<string, string[]> = {
      'technology': ['Innovation', 'Digital Transformation', 'Tech Trends', 'Industry Solutions', 'Future of Work'],
      'healthcare': ['Patient Care', 'Medical Innovation', 'Health & Wellness', 'Healthcare Technology', 'Clinical Excellence'],
      'finance': ['Financial Planning', 'Investment Strategies', 'Economic Insights', 'Risk Management', 'Market Analysis'],
      'retail': ['Customer Experience', 'Product Showcases', 'Shopping Trends', 'Brand Stories', 'Seasonal Campaigns'],
      'manufacturing': ['Operational Excellence', 'Supply Chain', 'Quality Control', 'Industrial Innovation', 'Sustainability'],
      'education': ['Learning Methods', 'Educational Technology', 'Student Success', 'Curriculum Development', 'Academic Excellence']
    };

    // Find matching industry or return generic themes
    for (const [key, themes] of Object.entries(themeMap)) {
      if (industryLower.includes(key)) {
        return themes;
      }
    }

    return ['Industry Leadership', 'Customer Success', 'Innovation', 'Company Culture', 'Market Insights'];
  }

  private generateKeyDifferentiators(industry: string): string[] {
    const industryLower = industry.toLowerCase();
    
    const differentiatorMap: Record<string, string[]> = {
      'technology': ['Cutting-edge innovation', 'Scalable solutions', 'Expert technical team', 'Proven track record'],
      'healthcare': ['Patient-focused approach', 'Clinical expertise', 'Advanced medical technology', 'Quality outcomes'],
      'finance': ['Personalized service', 'Risk management expertise', 'Regulatory compliance', 'Transparent communication'],
      'retail': ['Customer-centric experience', 'Quality products', 'Competitive pricing', 'Excellent service'],
      'manufacturing': ['Quality manufacturing', 'Efficient processes', 'Reliable delivery', 'Cost-effective solutions'],
      'education': ['Innovative teaching methods', 'Experienced educators', 'Student-centered approach', 'Academic excellence']
    };

    for (const [key, differentiators] of Object.entries(differentiatorMap)) {
      if (industryLower.includes(key)) {
        return differentiators;
      }
    }

    return ['Quality service', 'Customer focus', 'Industry expertise', 'Reliable solutions'];
  }

  private generateCompetitivePosition(industry: string, size: CompanySizeIndicator): string {
    const industryLower = industry.toLowerCase();
    
    if (size === 'Startup') {
      return `Agile ${industry} innovator bringing fresh perspectives and cutting-edge solutions to market.`;
    } else if (size === 'Enterprise' || size === 'Corporation') {
      return `Established ${industry} leader with proven expertise and comprehensive solutions at scale.`;
    } else {
      return `Growing ${industry} company combining personalized service with professional expertise.`;
    }
  }

  private generateBrandPersonality(industry: string, size: CompanySizeIndicator): string[] {
    const industryLower = industry.toLowerCase();
    
    const basePersonality = ['Professional', 'Reliable', 'Customer-focused'];
    
    if (industryLower.includes('technology')) {
      basePersonality.push('Innovative', 'Forward-thinking');
    } else if (industryLower.includes('healthcare')) {
      basePersonality.push('Caring', 'Trustworthy');
    } else if (industryLower.includes('finance')) {
      basePersonality.push('Trustworthy', 'Analytical');
    }
    
    if (size === 'Startup') {
      basePersonality.push('Agile', 'Dynamic');
    } else if (size === 'Enterprise' || size === 'Corporation') {
      basePersonality.push('Established', 'Authoritative');
    }
    
    return basePersonality;
  }

  private generateInsights(company: Company, size: CompanySizeIndicator, targetMarket: TargetMarket): string[] {
    const insights = [];
    
    insights.push(`${company.name} operates in the ${company.industry} sector with a ${targetMarket} focus.`);
    insights.push(`As a ${size} company, content should emphasize ${this.getSizeBasedFocus(size)}.`);
    insights.push(`Location in ${company.location.city}, ${company.location.country} provides ${this.getLocationInsight(company.location.country)}.`);
    
    if (company.website) {
      insights.push(`Company website presence suggests established digital marketing capabilities.`);
    }
    
    return insights;
  }

  private getSizeBasedFocus(size: CompanySizeIndicator): string {
    switch (size) {
      case 'Startup':
        return 'innovation, agility, and growth potential';
      case 'SMB':
        return 'personalized service and specialized expertise';
      case 'Enterprise':
        return 'proven solutions and industry leadership';
      case 'Corporation':
        return 'scale, reliability, and comprehensive offerings';
      default:
        return 'unique value proposition';
    }
  }

  private getLocationInsight(country: string): string {
    // Simple location-based insights
    const locationMap: Record<string, string> = {
      'United States': 'access to large diverse markets and innovation hubs',
      'Canada': 'stable business environment and multicultural perspectives',
      'United Kingdom': 'gateway to European markets and financial services expertise',
      'Germany': 'engineering excellence and manufacturing heritage',
      'Japan': 'technological innovation and quality-focused culture',
      'Australia': 'Asia-Pacific market access and resource industry strength'
    };
    
    return locationMap[country] || 'unique regional market opportunities';
  }
}